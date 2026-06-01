import { GENERIC_DISCLAIMER_PATTERNS, THRESHOLDS } from "../constants.js";
import { rankAndCap } from "../rank-and-cap.js";
import type {
  CandidateRisk,
  DecisionRisk,
  IntentClass,
  StakesSignal,
} from "../types.js";

export interface RiskFilterContext {
  answerId: string;
  intentClass: IntentClass;
  stakesSignal: StakesSignal;
}

export function isGenericDisclaimer(text: string): boolean {
  return GENERIC_DISCLAIMER_PATTERNS.some((p) => p.test(text));
}

/**
 * Single candidate — Architecture §11 risk decision tree.
 */
export function shouldShowRisk(
  candidate: CandidateRisk,
  ctx: RiskFilterContext
): boolean {
  const combined = `${candidate.description} ${candidate.decisionImpact}`;

  if (candidate.genericDisclaimer || isGenericDisclaimer(combined)) {
    return false;
  }
  if (candidate.impactScore < THRESHOLDS.RISK_DECISION_IMPACT_MIN) {
    return false;
  }
  if (!candidate.specificToAnswer) return false;
  if (!candidate.wouldChangeAction) return false;

  if (ctx.intentClass === "informational" && ctx.stakesSignal === "low") {
    return false;
  }

  return true;
}

export function filterRisks(
  candidates: CandidateRisk[],
  ctx: RiskFilterContext
): DecisionRisk[] {
  const passed = candidates.filter((c) => shouldShowRisk(c, ctx));
  const ranked = rankAndCap(passed, THRESHOLDS.MAX_DISPLAYED_RISKS);

  return ranked.map((c, i) => ({
    ...c,
    answerId: ctx.answerId,
    displayed: true,
    rank: i + 1,
    showReason:
      c.showReason ??
      "If this happens, you may need to change your decision before acting.",
  }));
}
