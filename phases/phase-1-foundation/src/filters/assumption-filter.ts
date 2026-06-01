import {
  THRESHOLDS,
  TRIVIAL_ASSUMPTION_PATTERNS,
} from "../constants.js";
import { isExplicitInPromptOrAnswer } from "../eligibility.js";
import { rankAndCap } from "../rank-and-cap.js";
import type {
  Assumption,
  CandidateAssumption,
  IntentClass,
  StakesSignal,
} from "../types.js";

export interface AssumptionFilterContext {
  answerId: string;
  promptContent: string;
  answerContent: string;
  intentClass: IntentClass;
  stakesSignal: StakesSignal;
}

function isTrivialStatement(statement: string): boolean {
  return TRIVIAL_ASSUMPTION_PATTERNS.some((p) => p.test(statement));
}

/**
 * Single candidate — Architecture §11 assumption decision tree.
 */
export function shouldShowAssumption(
  candidate: CandidateAssumption,
  ctx: AssumptionFilterContext
): boolean {
  const explicit =
    candidate.explicitInPromptOrAnswer ||
    isExplicitInPromptOrAnswer(
      candidate.statement,
      ctx.promptContent,
      ctx.answerContent
    );

  if (explicit) return false;
  if (candidate.impactScore < THRESHOLDS.ASSUMPTION_IMPACT_MIN) return false;
  if (candidate.trivialOrUniversal || isTrivialStatement(candidate.statement)) {
    return false;
  }
  if (!candidate.changesCorrectnessOrApplicability) return false;
  if (!candidate.userVerifiable) return false;

  return true;
}

export function filterAssumptions(
  candidates: CandidateAssumption[],
  ctx: AssumptionFilterContext
): Assumption[] {
  const passed = candidates.filter((c) => shouldShowAssumption(c, ctx));

  const deduped = dedupeByStatement(passed);
  const ranked = rankAndCap(deduped, THRESHOLDS.MAX_DISPLAYED_ASSUMPTIONS);

  return ranked.map((c, i) => ({
    ...c,
    answerId: ctx.answerId,
    displayed: true,
    rank: i + 1,
    impactLevel:
      c.impactLevel ??
      (c.impactScore >= 0.85 ? "high" : "medium"),
    showReason:
      c.showReason ??
      "This premise affects whether the answer applies to your situation.",
  }));
}

function dedupeByStatement(
  items: CandidateAssumption[]
): CandidateAssumption[] {
  const seen = new Set<string>();
  const out: CandidateAssumption[] = [];
  for (const item of items) {
    const key = item.statement.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
