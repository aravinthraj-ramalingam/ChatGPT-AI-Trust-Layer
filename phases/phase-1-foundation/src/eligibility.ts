import { THRESHOLDS } from "./constants.js";
import type { Answer, IntentClass, PromptMetadata, StakesSignal } from "./types.js";

export interface EligibilityInput {
  promptContent: string;
  answerContent: string;
  metadata: PromptMetadata;
  policyBlocked?: boolean;
  answerIncomplete?: boolean;
}

export interface EligibilityResult {
  eligible: boolean;
  reason: string;
}

/**
 * Global judgment eligibility gate — Architecture §11.
 * Default: judgment layer OFF unless passed.
 */
export function evaluateJudgmentEligibility(
  input: EligibilityInput
): EligibilityResult {
  const { answerContent, metadata, policyBlocked, answerIncomplete } = input;

  if (policyBlocked) {
    return { eligible: false, reason: "policy_blocked" };
  }
  if (answerIncomplete) {
    return { eligible: false, reason: "answer_incomplete" };
  }
  if (metadata.intentClass === "chitchat") {
    return { eligible: false, reason: "chitchat" };
  }
  if (metadata.intentClass === "creative") {
    return { eligible: false, reason: "creative" };
  }
  if (estimateTokenCount(answerContent) < THRESHOLDS.MIN_ANSWER_TOKENS_FOR_JUDGMENT) {
    return { eligible: false, reason: "answer_too_short" };
  }
  if (
    metadata.intentClass === "informational" &&
    metadata.stakesSignal === "low"
  ) {
    return { eligible: false, reason: "informational_low_stakes" };
  }

  return { eligible: true, reason: "eligible" };
}

/** Master table: should assumption/risk detection run for this intent+stakes? */
export function shouldRunAssumptionDetection(
  intent: IntentClass,
  stakes: StakesSignal
): boolean {
  if (intent === "creative" || intent === "chitchat") return false;
  if (intent === "informational" && stakes === "low") return false;
  return true;
}

export function shouldRunRiskDetection(
  intent: IntentClass,
  stakes: StakesSignal
): boolean {
  if (intent === "creative" || intent === "chitchat") return false;
  if (intent === "informational" && stakes === "low") return false;
  if (stakes === "very_high" || stakes === "high") return true;
  return stakes !== "low" || intent === "decision" || intent === "planning";
}

/** Normalize stakes for scoring thresholds */
export function stakesWeight(stakes: StakesSignal): number {
  switch (stakes) {
    case "very_high":
      return 1;
    case "high":
      return 0.85;
    case "medium":
      return 0.55;
    case "low":
      return 0.25;
  }
}

export function applyEligibilityToAnswer(
  answer: Answer,
  result: EligibilityResult
): Answer {
  return {
    ...answer,
    judgmentEligible: result.eligible,
    judgmentStatus: result.eligible ? "pending" : "skipped",
  };
}

/** Rough token estimate (~4 chars per token) */
export function estimateTokenCount(text: string): number {
  const normalized = text.trim();
  if (!normalized) return 0;
  return Math.ceil(normalized.length / 4);
}

/** Returns true if text appears in prompt or answer (case-insensitive substring) */
export function isExplicitInPromptOrAnswer(
  premise: string,
  promptContent: string,
  answerContent: string
): boolean {
  const needle = premise.trim().toLowerCase();
  if (needle.length < 8) return false;
  const hayPrompt = promptContent.toLowerCase();
  const hayAnswer = answerContent.toLowerCase();
  return hayPrompt.includes(needle) || hayAnswer.includes(needle);
}
