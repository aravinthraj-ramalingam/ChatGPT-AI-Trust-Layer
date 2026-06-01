import type { IntentClass, PromptMetadata, StakesSignal } from "./types.js";
import {
  CHITCHAT_PATTERNS,
  CREATIVE_PATTERNS,
  DECISION_INTENT_PATTERNS,
  HIGH_STAKES_PATTERNS,
  PLANNING_INTENT_PATTERNS,
} from "./constants.js";

/**
 * Lightweight prompt classifier (MVP) — Architecture §8 Step 1.
 * No personalization; rule-based only.
 */
export function classifyPrompt(content: string): PromptMetadata {
  const trimmed = content.trim();
  const intentClass = detectIntent(trimmed);
  const stakesSignal = detectStakes(trimmed, intentClass);
  return { intentClass, stakesSignal };
}

function detectIntent(content: string): IntentClass {
  if (CHITCHAT_PATTERNS.some((p) => p.test(content))) {
    return "chitchat";
  }
  if (CREATIVE_PATTERNS.some((p) => p.test(content))) {
    return "creative";
  }
  if (DECISION_INTENT_PATTERNS.some((p) => p.test(content))) {
    return "decision";
  }
  if (PLANNING_INTENT_PATTERNS.some((p) => p.test(content))) {
    return "planning";
  }
  return "informational";
}

function detectStakes(content: string, intent: IntentClass): StakesSignal {
  if (intent === "chitchat" || intent === "creative") {
    return "low";
  }
  if (HIGH_STAKES_PATTERNS.some((p) => p.test(content))) {
    return "high";
  }
  if (intent === "decision") {
    return "high";
  }
  if (intent === "planning") {
    return "medium";
  }
  return "low";
}
