/** Rollout and kill switch types — Architecture §10 cross-cutting */

import type { FeatureFlags } from "@ttj/phase-3-pipeline";

export interface KillSwitchDrillResult {
  executedAt: Date;
  killSwitchActivated: boolean;
  judgmentSuppressed: boolean;
  pipelineSkipped: boolean;
  uiHidden: boolean;
  checksPassed: number;
  checksFailed: number;
  checks: DrillCheck[];
  passed: boolean;
}

export interface DrillCheck {
  name: string;
  description: string;
  passed: boolean;
  detail?: string;
}

export interface RolloutStep {
  /** Traffic percentage (0–100) */
  trafficPercent: number;
  /** Flags for this step */
  flags: FeatureFlags;
}

export interface RolloutStepResult {
  step: RolloutStep;
  turnsExecuted: number;
  errorsEncountered: number;
  judgmentActive: boolean;
  errorRate: number;
  passed: boolean;
}

export interface ControlledRolloutResult {
  executedAt: Date;
  steps: RolloutStepResult[];
  totalTurns: number;
  totalErrors: number;
  allStepsPassed: boolean;
}
