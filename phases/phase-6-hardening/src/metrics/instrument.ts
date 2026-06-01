import type { MetricsInput, VarMetrics, GuardrailMetrics, MetricEvent } from "./types.js";

/**
 * Compute Verified Action Rate (VAR) — north star metric.
 * Architecture §15: % of judgment-eligible answers where user expands judgment
 * AND marks >= 1 verification done OR submits positive verification feedback.
 */
export function computeVarMetrics(input: MetricsInput): VarMetrics {
  const verifiedActionCount =
    input.verificationsMarkedDone + input.positiveVerificationFeedback;

  return {
    totalEligibleAnswers: input.totalEligibleAnswers,
    answersWithExpand: input.answersWithJudgmentExpanded,
    verifiedActionCount,
    verifiedActionRate:
      input.totalEligibleAnswers > 0
        ? verifiedActionCount / input.totalEligibleAnswers
        : 0,
  };
}

/**
 * Compute guardrail metrics — Architecture §15.
 * Warning fatigue, answer satisfaction, regenerate rate, hide rate.
 */
export function computeGuardrailMetrics(input: MetricsInput): GuardrailMetrics {
  const totalLayerFeedback =
    input.feedbackByTargetType.layer.positive +
    input.feedbackByTargetType.layer.negative;

  const totalFeedbackItems = Object.values(input.feedbackByTargetType).reduce(
    (sum, v) => sum + v.positive + v.negative,
    0
  );

  const totalNegativeLayer = input.feedbackByTargetType.layer.negative;
  const warningFatigueRate =
    input.totalExpands > 0 ? totalNegativeLayer / input.totalExpands : 0;

  const answerPositive = input.feedbackByTargetType.layer.positive;
  const answerTotal = totalLayerFeedback;
  const answerSatisfactionRate =
    answerTotal > 0 ? answerPositive / answerTotal : 0;

  const regenerateAfterJudgmentRate =
    input.totalRegenerates > 0
      ? input.regeneratesAfterJudgment / input.totalRegenerates
      : 0;

  const hideWithoutReadingRate =
    input.totalExpands > 0
      ? input.collapsesWithoutReading / input.totalExpands
      : 0;

  return {
    warningFatigueRate,
    answerSatisfactionRate,
    regenerateAfterJudgmentRate,
    hideWithoutReadingRate,
    totalFeedbackItems,
  };
}

/**
 * Create a MetricEvent for instrumentation/logging.
 */
export function createMetricEvent(
  type: MetricEvent["type"],
  name: string,
  value: number,
  unit: string,
  tags?: Record<string, string>
): MetricEvent {
  return {
    type,
    name,
    value,
    unit,
    timestamp: new Date(),
    tags,
  };
}

/**
 * Generate all metric events from a MetricsInput.
 */
export function generateMetricEvents(input: MetricsInput): MetricEvent[] {
  const varMetrics = computeVarMetrics(input);
  const guardrailMetrics = computeGuardrailMetrics(input);

  return [
    createMetricEvent("var", "verified_action_rate", varMetrics.verifiedActionRate, "ratio"),
    createMetricEvent("var", "answers_with_expand", varMetrics.answersWithExpand, "count"),
    createMetricEvent("var", "verified_action_count", varMetrics.verifiedActionCount, "count"),
    createMetricEvent(
      "guardrail",
      "warning_fatigue_rate",
      guardrailMetrics.warningFatigueRate,
      "ratio"
    ),
    createMetricEvent(
      "guardrail",
      "answer_satisfaction_rate",
      guardrailMetrics.answerSatisfactionRate,
      "ratio"
    ),
    createMetricEvent(
      "guardrail",
      "regenerate_after_judgment_rate",
      guardrailMetrics.regenerateAfterJudgmentRate,
      "ratio"
    ),
    createMetricEvent(
      "guardrail",
      "hide_without_reading_rate",
      guardrailMetrics.hideWithoutReadingRate,
      "ratio"
    ),
  ];
}
