import { isJudgmentActive, type FeatureFlags } from "@ttj/phase-3-pipeline";
import type {
  ControlledRolloutResult,
  RolloutStep,
  RolloutStepResult,
} from "./types.js";

export interface RolloutConfig {
  /** Traffic percentage increments for each step */
  steps: number[];
  /** Number of simulated turns per step */
  turnsPerStep: number;
  /** Error rate threshold that fails a step (0–1) */
  errorRateThreshold: number;
  /** Optional callback to simulate a turn — return true for success */
  simulateTurn?: (flags: FeatureFlags) => Promise<boolean>;
}

const DEFAULT_CONFIG: RolloutConfig = {
  steps: [10, 25, 50, 75, 100],
  turnsPerStep: 10,
  errorRateThreshold: 0.05,
};

/**
 * Simulate a controlled rollout with increasing traffic percentages.
 * At each step, runs simulated turns and checks error rates.
 */
export async function simulateControlledRollout(
  config: Partial<RolloutConfig> = {}
): Promise<ControlledRolloutResult> {
  const cfg = { ...DEFAULT_CONFIG, ...config };
  const stepResults: RolloutStepResult[] = [];
  let totalTurns = 0;
  let totalErrors = 0;

  for (const trafficPercent of cfg.steps) {
    const flags: FeatureFlags = {
      trustThroughJudgmentEnabled: true,
      judgmentKillSwitch: false,
    };

    const step: RolloutStep = { trafficPercent, flags };
    const judgmentActive = isJudgmentActive(flags);

    let errorsEncountered = 0;
    let turnsExecuted = 0;

    for (let i = 0; i < cfg.turnsPerStep; i++) {
      turnsExecuted++;
      totalTurns++;

      if (cfg.simulateTurn) {
        const success = await cfg.simulateTurn(flags);
        if (!success) {
          errorsEncountered++;
          totalErrors++;
        }
      }
      // If no simulateTurn provided, all turns succeed by default
    }

    const errorRate =
      turnsExecuted > 0 ? errorsEncountered / turnsExecuted : 0;

    stepResults.push({
      step,
      turnsExecuted,
      errorsEncountered,
      judgmentActive,
      errorRate,
      passed: errorRate <= cfg.errorRateThreshold,
    });
  }

  return {
    executedAt: new Date(),
    steps: stepResults,
    totalTurns,
    totalErrors,
    allStepsPassed: stepResults.every((s) => s.passed),
  };
}
