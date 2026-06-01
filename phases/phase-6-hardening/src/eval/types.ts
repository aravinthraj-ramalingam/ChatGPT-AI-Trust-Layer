import type { PromptMetadata } from "@ttj/phase-1-foundation";

/**
 * Single eval case: a prompt/answer pair with expected judgment items.
 * Used to measure false positive / false negative rates.
 */
export interface EvalCase {
  id: string;
  promptContent: string;
  answerContent: string;
  metadata?: PromptMetadata;
  /** Assumption statements that SHOULD surface (true positives expected) */
  expectedAssumptions: string[];
  /** Risk descriptions that SHOULD surface (true positives expected) */
  expectedRisks: string[];
  /** Assumption-like statements that should NOT surface (true negatives expected) */
  unexpectedAssumptions: string[];
  /** Risk-like statements that should NOT surface (true negatives expected) */
  unexpectedRisks: string[];
}

/** Classification of a single eval item */
export type EvalClassification =
  | "true_positive"
  | "false_positive"
  | "true_negative"
  | "false_negative";

/** Result of running a single eval case */
export interface EvalCaseResult {
  caseId: string;
  assumptionClassifications: EvalItemClassification[];
  riskClassifications: EvalItemClassification[];
  surfacedAssumptions: string[];
  surfacedRisks: string[];
  elapsedMs: number;
}

export interface EvalItemClassification {
  expected: string;
  matched?: string;
  classification: EvalClassification;
}

/** Aggregated eval report across all cases */
export interface EvalReport {
  totalCases: number;
  assumptionMetrics: EvalMetrics;
  riskMetrics: EvalMetrics;
  caseResults: EvalCaseResult[];
  totalElapsedMs: number;
}

export interface EvalMetrics {
  truePositives: number;
  falsePositives: number;
  trueNegatives: number;
  falseNegatives: number;
  precision: number;
  recall: number;
  f1: number;
  falsePositiveRate: number;
  falseNegativeRate: number;
}
