import type { LatencyBudget } from "./types.js";

/**
 * Default performance budgets from Architecture §14.
 * Judgment layer p95 ≤ 3s, p99 ≤ 8s.
 */
export const DEFAULT_BUDGETS: LatencyBudget[] = [
  { name: "judgment_p95", maxMs: 3000, percentile: 95 },
  { name: "judgment_p99", maxMs: 8000, percentile: 99 },
];

/**
 * Check a measured percentile value against a budget.
 */
export function checkBudget(
  budget: LatencyBudget,
  actualMs: number
): { passed: boolean; marginMs: number } {
  const marginMs = budget.maxMs - actualMs;
  return { passed: marginMs >= 0, marginMs };
}
