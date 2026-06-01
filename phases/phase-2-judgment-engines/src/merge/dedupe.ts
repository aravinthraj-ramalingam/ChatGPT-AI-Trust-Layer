import { similarity } from "../utils/sentences.js";

const DUPLICATE_THRESHOLD = 0.72;

export function dedupeByKey<T>(
  items: T[],
  keyFn: (item: T) => string,
  threshold = DUPLICATE_THRESHOLD
): T[] {
  const kept: T[] = [];
  for (const item of items) {
    const key = keyFn(item);
    const duplicate = kept.some(
      (existing) => similarity(keyFn(existing), key) >= threshold
    );
    if (!duplicate) kept.push(item);
  }
  return kept;
}

/**
 * Merge assumption-like and risk-like statements that describe the same premise.
 * Keeps the higher impactScore item.
 */
export function mergeOverlappingCandidates<A, R>(
  assumptions: A[],
  risks: R[],
  assumptionKey: (a: A) => string,
  riskKey: (r: R) => string
): { assumptions: A[]; risks: R[] } {
  const filteredRisks: R[] = [];

  for (const risk of risks) {
    const overlapsAssumption = assumptions.some(
      (a) => similarity(assumptionKey(a), riskKey(risk)) >= DUPLICATE_THRESHOLD
    );
    if (!overlapsAssumption) filteredRisks.push(risk);
  }

  return { assumptions, risks: filteredRisks };
}
