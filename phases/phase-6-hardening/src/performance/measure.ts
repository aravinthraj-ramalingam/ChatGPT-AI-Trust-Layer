import { runJudgmentPipeline } from "@ttj/phase-2-judgment-engines";
import type { PromptMetadata } from "@ttj/phase-1-foundation";
import { DEFAULT_BUDGETS, checkBudget } from "./budgets.js";
import type {
  LatencyBudget,
  LatencySample,
  PercentileResult,
  PerformanceReport,
  BudgetCheckResult,
} from "./types.js";

export interface MeasureConfig {
  fixtures: Array<{
    promptContent: string;
    answerContent: string;
    metadata?: PromptMetadata;
  }>;
  iterations: number;
  budgets?: LatencyBudget[];
}

/**
 * Measure judgment pipeline latency over multiple iterations.
 * Returns a PerformanceReport with percentile stats and budget checks.
 */
export async function measureJudgmentLatency(
  config: MeasureConfig
): Promise<PerformanceReport> {
  const budgets = config.budgets ?? DEFAULT_BUDGETS;
  const samples: LatencySample[] = [];

  for (let i = 0; i < config.iterations; i++) {
    const fixture = config.fixtures[i % config.fixtures.length]!;
    const start = performance.now();
    let success = true;

    try {
      await runJudgmentPipeline({
        answerId: `perf-${i}`,
        promptContent: fixture.promptContent,
        answerContent: fixture.answerContent,
        metadata: fixture.metadata,
      });
    } catch {
      success = false;
    }

    samples.push({
      label: `iteration-${i}`,
      latencyMs: performance.now() - start,
      timestamp: new Date(),
      success,
    });
  }

  const successfulSamples = samples.filter((s) => s.success);
  const failedSamples = samples.filter((s) => !s.success);
  const latencies = successfulSamples.map((s) => s.latencyMs).sort((a, b) => a - b);

  const percentiles = computePercentiles(latencies);

  const budgetChecks: BudgetCheckResult[] = budgets.map((budget) => {
    const actualMs = getPercentileValue(latencies, budget.percentile);
    const result = checkBudget(budget, actualMs);
    return {
      budget,
      actualMs,
      passed: result.passed,
      marginMs: result.marginMs,
    };
  });

  return {
    samples,
    successfulSamples,
    failedSamples,
    percentiles,
    budgetChecks,
    allBudgetsPassed: budgetChecks.every((b) => b.passed),
  };
}

function computePercentiles(sortedLatencies: number[]): PercentileResult {
  if (sortedLatencies.length === 0) {
    return { p50: 0, p95: 0, p99: 0, min: 0, max: 0, mean: 0 };
  }

  return {
    p50: getPercentileValue(sortedLatencies, 50),
    p95: getPercentileValue(sortedLatencies, 95),
    p99: getPercentileValue(sortedLatencies, 99),
    min: sortedLatencies[0]!,
    max: sortedLatencies[sortedLatencies.length - 1]!,
    mean: sortedLatencies.reduce((a, b) => a + b, 0) / sortedLatencies.length,
  };
}

function getPercentileValue(sortedLatencies: number[], percentile: number): number {
  if (sortedLatencies.length === 0) return 0;
  const index = Math.ceil((percentile / 100) * sortedLatencies.length) - 1;
  return sortedLatencies[Math.max(0, index)]!;
}
