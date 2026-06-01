/** Performance measurement types — Architecture §14 */

export interface LatencyBudget {
  /** Metric name (e.g., "judgment_p95") */
  name: string;
  /** Maximum allowed latency in milliseconds */
  maxMs: number;
  /** Percentile (0–100) */
  percentile: number;
}

export interface LatencySample {
  label: string;
  latencyMs: number;
  timestamp: Date;
  success: boolean;
}

export interface PercentileResult {
  p50: number;
  p95: number;
  p99: number;
  min: number;
  max: number;
  mean: number;
}

export interface PerformanceReport {
  samples: LatencySample[];
  successfulSamples: LatencySample[];
  failedSamples: LatencySample[];
  percentiles: PercentileResult;
  budgetChecks: BudgetCheckResult[];
  allBudgetsPassed: boolean;
}

export interface BudgetCheckResult {
  budget: LatencyBudget;
  actualMs: number;
  passed: boolean;
  marginMs: number;
}
