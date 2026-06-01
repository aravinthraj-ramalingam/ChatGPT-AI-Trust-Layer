import { THRESHOLDS } from "./constants.js";

export interface Rankable {
  id: string;
  impactScore: number;
}

/**
 * Sort by impact descending and cap to max display count.
 * When over cap, lowest-ranked items are dropped.
 */
export function rankAndCap<T extends Rankable>(
  items: T[],
  max: number = THRESHOLDS.MAX_DISPLAYED_ASSUMPTIONS
): T[] {
  return [...items]
    .sort((a, b) => b.impactScore - a.impactScore)
    .slice(0, max)
    .map((item, index) => ({ ...item, rank: index + 1 }));
}

/** Attach 1-based rank after filtering */
export function assignRanks<T>(items: T[]): Array<T & { rank: number }> {
  return items.map((item, index) => ({ ...item, rank: index + 1 }));
}
