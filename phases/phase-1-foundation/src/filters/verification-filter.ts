import { THRESHOLDS, VAGUE_VERIFICATION_PATTERNS } from "../constants.js";
import { rankAndCap } from "../rank-and-cap.js";
import type { CandidateVerification, VerificationAction } from "../types.js";

export interface VerificationFilterContext {
  answerId: string;
}

export function isVagueVerification(actionText: string): boolean {
  const trimmed = actionText.trim();
  return VAGUE_VERIFICATION_PATTERNS.some((p) => p.test(trimmed));
}

/** Action must start with a verb-like word (simple MVP linter) */
export function hasActionableVerb(actionText: string): boolean {
  const firstWord = actionText.trim().split(/\s+/)[0]?.toLowerCase() ?? "";
  const verbs = [
    "check",
    "confirm",
    "compare",
    "review",
    "validate",
    "verify",
    "read",
    "search",
    "ask",
    "cross-reference",
    "cross",
    "look",
    "open",
    "download",
    "call",
    "email",
  ];
  return verbs.some((v) => firstWord === v || firstWord.startsWith(v));
}

/**
 * Single candidate — Architecture §11 verification appear/suppress.
 */
export function shouldShowVerification(
  candidate: CandidateVerification
): boolean {
  if (!candidate.parentDisplayed) return false;
  if (candidate.vagueOrGeneric || isVagueVerification(candidate.actionText)) {
    return false;
  }
  if (!hasActionableVerb(candidate.actionText)) return false;
  if (
    candidate.estimatedMinutes > THRESHOLDS.MAX_VERIFICATION_EFFORT_MINUTES
  ) {
    return false;
  }
  if (candidate.duplicatesReadingAnswer) return false;
  return true;
}

export function filterVerifications(
  candidates: CandidateVerification[],
  ctx: VerificationFilterContext
): VerificationAction[] {
  const passed = candidates.filter((c) => shouldShowVerification(c));
  const deduped = dedupeByActionText(passed);
  const ranked = rankAndCap(deduped, THRESHOLDS.MAX_DISPLAYED_VERIFICATIONS);

  return ranked.map((c, i) => ({
    ...c,
    answerId: ctx.answerId,
    displayed: true,
    rank: i + 1,
  }));
}

function dedupeByActionText(
  items: CandidateVerification[]
): CandidateVerification[] {
  const seen = new Set<string>();
  const out: CandidateVerification[] = [];
  for (const item of items) {
    const key = item.actionText.trim().toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    out.push(item);
  }
  return out;
}
