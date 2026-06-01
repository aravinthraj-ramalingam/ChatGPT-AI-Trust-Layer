import type { EvalMetrics, EvalItemClassification } from "./types.js";

/**
 * Compute eval metrics from an array of item classifications.
 * Calculates TP, FP, TN, FN, precision, recall, F1, FP rate, FN rate.
 */
export function computeEvalMetrics(
  classifications: EvalItemClassification[]
): EvalMetrics {
  let truePositives = 0;
  let falsePositives = 0;
  let trueNegatives = 0;
  let falseNegatives = 0;

  for (const item of classifications) {
    switch (item.classification) {
      case "true_positive":
        truePositives++;
        break;
      case "false_positive":
        falsePositives++;
        break;
      case "true_negative":
        trueNegatives++;
        break;
      case "false_negative":
        falseNegatives++;
        break;
    }
  }

  const precision =
    truePositives + falsePositives > 0
      ? truePositives / (truePositives + falsePositives)
      : 0;
  const recall =
    truePositives + falseNegatives > 0
      ? truePositives / (truePositives + falseNegatives)
      : 0;
  const f1 =
    precision + recall > 0 ? (2 * precision * recall) / (precision + recall) : 0;

  const falsePositiveRate =
    falsePositives + trueNegatives > 0
      ? falsePositives / (falsePositives + trueNegatives)
      : 0;
  const falseNegativeRate =
    falseNegatives + truePositives > 0
      ? falseNegatives / (falseNegatives + truePositives)
      : 0;

  return {
    truePositives,
    falsePositives,
    trueNegatives,
    falseNegatives,
    precision,
    recall,
    f1,
    falsePositiveRate,
    falseNegativeRate,
  };
}

/**
 * Classify a single expected/unexpected item against surfaced items.
 * Uses fuzzy substring matching (case-insensitive).
 */
export function classifyItem(
  expected: string,
  isExpectedToSurface: boolean,
  surfacedItems: string[]
): EvalItemClassification {
  const matched = findBestMatch(expected, surfacedItems);

  if (isExpectedToSurface) {
    // Expected to surface: if matched → TP, else → FN
    return {
      expected,
      matched: matched ?? undefined,
      classification: matched ? "true_positive" : "false_negative",
    };
  } else {
    // Not expected to surface: if matched → FP, else → TN
    return {
      expected,
      matched: matched ?? undefined,
      classification: matched ? "false_positive" : "true_negative",
    };
  }
}

/**
 * Merge classifications from multiple categories into one array
 * for aggregate metric computation.
 */
export function mergeClassifications(
  ...groups: EvalItemClassification[][]
): EvalItemClassification[] {
  return groups.flat();
}

function findBestMatch(
  target: string,
  candidates: string[]
): string | null {
  const normalizedTarget = target.toLowerCase().trim();

  for (const candidate of candidates) {
    const normalizedCandidate = candidate.toLowerCase().trim();
    // Substring match in either direction
    if (
      normalizedCandidate.includes(normalizedTarget) ||
      normalizedTarget.includes(normalizedCandidate)
    ) {
      return candidate;
    }
    // Token overlap: if >50% of significant tokens overlap
    const targetTokens = tokenize(normalizedTarget);
    const candidateTokens = tokenize(normalizedCandidate);
    if (targetTokens.size === 0 || candidateTokens.size === 0) continue;

    let overlap = 0;
    for (const t of targetTokens) {
      if (candidateTokens.has(t)) overlap++;
    }
    const overlapRatio = overlap / Math.min(targetTokens.size, candidateTokens.size);
    if (overlapRatio >= 0.5) {
      return candidate;
    }
  }

  return null;
}

function tokenize(text: string): Set<string> {
  const stopWords = new Set([
    "the", "a", "an", "is", "are", "was", "were", "be", "been",
    "could", "should", "would", "may", "might", "will", "can",
  ]);
  return new Set(
    text
      .split(/\s+/)
      .filter((w) => w.length > 2 && !stopWords.has(w))
  );
}
