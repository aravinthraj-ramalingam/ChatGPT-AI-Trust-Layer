/** Metric instrumentation types — Architecture §15 */

import type { FeedbackTargetType } from "@ttj/phase-1-foundation";

/** Verified Action Rate — north star metric (Architecture §15) */
export interface VarMetrics {
  /** Total judgment-eligible answers evaluated */
  totalEligibleAnswers: number;
  /** Answers where user expanded judgment panel */
  answersWithExpand: number;
  /** Answers where user marked >= 1 verification done or gave positive verification feedback */
  verifiedActionCount: number;
  /** VAR: verifiedActionCount / totalEligibleAnswers */
  verifiedActionRate: number;
}

/** Guardrail metrics — Architecture §15 */
export interface GuardrailMetrics {
  /** Warning fatigue proxy: negative feedback / total expands */
  warningFatigueRate: number;
  /** Answer satisfaction (positive answer feedback ratio) */
  answerSatisfactionRate: number;
  /** Regenerate rate after judgment shown */
  regenerateAfterJudgmentRate: number;
  /** Hide rate: users collapse without reading */
  hideWithoutReadingRate: number;
  /** Total feedback items processed */
  totalFeedbackItems: number;
}

/** A single metric event for logging/instrumentation */
export interface MetricEvent {
  type: "var" | "guardrail" | "performance" | "eval";
  name: string;
  value: number;
  unit: string;
  timestamp: Date;
  tags?: Record<string, string>;
}

/** Input for computing metrics from session data */
export interface MetricsInput {
  totalEligibleAnswers: number;
  answersWithJudgmentExpanded: number;
  verificationsMarkedDone: number;
  positiveVerificationFeedback: number;
  feedbackByTargetType: Record<FeedbackTargetType, { positive: number; negative: number }>;
  totalRegenerates: number;
  regeneratesAfterJudgment: number;
  totalExpands: number;
  collapsesWithoutReading: number;
}
