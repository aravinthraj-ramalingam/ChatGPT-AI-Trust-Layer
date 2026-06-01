import type { Feedback, FeedbackTargetType } from "@ttj/phase-1-foundation";
import type { FeedbackAggregate } from "./types.js";

/** Eval-oriented aggregates — no prompt text or PII */
export function aggregateFeedback(items: Feedback[]): FeedbackAggregate {
  const byTargetType: Record<FeedbackTargetType, number> = {
    layer: 0,
    assumption: 0,
    risk: 0,
    verification: 0,
  };

  let positive = 0;
  let negative = 0;
  let withComment = 0;

  for (const item of items) {
    byTargetType[item.targetType]++;
    if (item.signal === "positive") positive++;
    else negative++;
    if (item.comment && item.comment.length > 0) withComment++;
  }

  return {
    total: items.length,
    positive,
    negative,
    withComment,
    byTargetType,
  };
}

export function aggregateForEval(
  items: Feedback[],
  answerId?: string
): FeedbackAggregate & { answerId?: string } {
  const filtered = answerId
    ? items.filter((f) => f.answerId === answerId)
    : items;

  return {
    ...aggregateFeedback(filtered),
    ...(answerId ? { answerId } : {}),
  };
}
