import type {
  FeedbackSignal,
  FeedbackTargetType,
} from "@ttj/phase-1-foundation";
import type { ValidateFeedbackResult } from "./types.js";

const TARGET_TYPES: FeedbackTargetType[] = [
  "layer",
  "assumption",
  "risk",
  "verification",
];

const SIGNALS: FeedbackSignal[] = ["positive", "negative"];

const MAX_COMMENT_LENGTH = 500;
const BLOCKED_PATTERNS = [/<script/i, /javascript:/i];

/** Layer-only feedback in MVP UI — other target types reserved for future */
const MVP_ALLOWED_TARGETS: FeedbackTargetType[] = ["layer"];

export interface ValidationOptions {
  /** When true, only layer feedback accepted (matches current UI) */
  layerOnly?: boolean;
}

export function validateFeedbackInput(
  raw: unknown,
  options: ValidationOptions = { layerOnly: true }
): ValidateFeedbackResult {
  const errors: string[] = [];

  if (!raw || typeof raw !== "object") {
    return { ok: false, errors: ["Body must be a JSON object"] };
  }

  const body = raw as Record<string, unknown>;
  const answerId = body.answerId;
  const targetType = body.targetType;
  const targetId = body.targetId;
  const signal = body.signal;
  const comment = body.comment;

  if (typeof answerId !== "string" || answerId.trim().length < 3) {
    errors.push("answerId is required");
  }

  if (
    typeof targetType !== "string" ||
    !TARGET_TYPES.includes(targetType as FeedbackTargetType)
  ) {
    errors.push("targetType must be layer, assumption, risk, or verification");
  } else if (
    options.layerOnly &&
    !MVP_ALLOWED_TARGETS.includes(targetType as FeedbackTargetType)
  ) {
    errors.push("Only layer feedback is accepted in this version");
  }

  if (typeof signal !== "string" || !SIGNALS.includes(signal as FeedbackSignal)) {
    errors.push("signal must be positive or negative");
  }

  if (targetId !== null && targetId !== undefined) {
    if (typeof targetId !== "string" || targetId.trim().length < 1) {
      errors.push("targetId must be a string or null");
    }
  }

  if (targetType === "layer" && targetId != null && targetId !== "") {
    errors.push("targetId must be null for layer feedback");
  }

  if (
    targetType !== "layer" &&
    (targetId === null || targetId === undefined || targetId === "")
  ) {
    errors.push("targetId is required for non-layer feedback");
  }

  let sanitizedComment: string | undefined;
  if (comment !== undefined && comment !== null && comment !== "") {
    if (typeof comment !== "string") {
      errors.push("comment must be a string");
    } else {
      const trimmed = comment.trim();
      if (trimmed.length > MAX_COMMENT_LENGTH) {
        errors.push(`comment must be at most ${MAX_COMMENT_LENGTH} characters`);
      } else if (BLOCKED_PATTERNS.some((p) => p.test(trimmed))) {
        errors.push("comment contains disallowed content");
      } else {
        sanitizedComment = trimmed;
      }
    }
  }

  if (errors.length > 0) {
    return { ok: false, errors };
  }

  return {
    ok: true,
    data: {
      answerId: (answerId as string).trim(),
      targetType: targetType as FeedbackTargetType,
      targetId:
        targetType === "layer"
          ? null
          : ((targetId as string) ?? null),
      signal: signal as FeedbackSignal,
      comment: sanitizedComment,
    },
  };
}
