import type {
  CandidateAssumption,
  StakesSignal,
} from "@ttj/phase-1-foundation";
import { isExplicitInPromptOrAnswer } from "@ttj/phase-1-foundation";
import { createId } from "../utils/id.js";
import { splitSentences } from "../utils/sentences.js";
import type { JudgmentEngineContext } from "../types.js";

const ASSUMPTION_PATTERNS: RegExp[] = [
  /\b(assuming|if|provided that|depends on|requires that|as long as)\b/i,
  /\b(is|are|will be) (expected|likely|projected|forecast)\b/i,
  /\b(assumes?|presumes?|expects?)\b/i,
  /\b(based on (the )?(current|latest|existing))\b/i,
  /\b(holds? steady|remains? stable|unchanged)\b/i,
];

const IMPLICIT_ASSUMPTION_TEMPLATES: Array<{
  pattern: RegExp;
  toStatement: (match: RegExpMatchArray, sentence: string) => string;
  baseScore: number;
}> = [
  {
    pattern: /\bassuming\s+(.+?)(?:[,.]|$)/i,
    toStatement: (m) => `It is assumed that ${cleanClause(m[1])}`,
    baseScore: 0.82,
  },
  {
    pattern: /\bif\s+(.+?),\s*(?:then\s+)?/i,
    toStatement: (m) => `${capitalize(cleanClause(m[1]))} holds true`,
    baseScore: 0.8,
  },
  {
    pattern: /\b(depends on|requires)\s+(.+?)(?:[,.]|$)/i,
    toStatement: (m) => `Outcome depends on ${cleanClause(m[2])}`,
    baseScore: 0.78,
  },
];

function cleanClause(clause: string): string {
  return clause.trim().replace(/\s+/g, " ").slice(0, 120);
}

function capitalize(s: string): string {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

function stakesBoost(stakes: StakesSignal): number {
  if (stakes === "very_high") return 0.1;
  if (stakes === "high") return 0.08;
  if (stakes === "medium") return 0.04;
  return 0;
}

function sentenceToAssumption(
  sentence: string,
  ctx: JudgmentEngineContext,
  baseScore: number
): CandidateAssumption | null {
  const statement = toAssumptionStatement(sentence);
  if (!statement || statement.length < 15) return null;

  const explicit = isExplicitInPromptOrAnswer(
    statement,
    ctx.promptContent,
    ctx.answerContent
  );

  const impactScore = Math.min(0.95, baseScore + stakesBoost(ctx.metadata.stakesSignal));

  return {
    id: createId("asm"),
    statement,
    impactScore,
    explicitInPromptOrAnswer: explicit,
    trivialOrUniversal: false,
    changesCorrectnessOrApplicability: true,
    userVerifiable: true,
    showReason:
      "The answer relies on this premise being true for its recommendation to apply.",
  };
}

function toAssumptionStatement(sentence: string): string {
  for (const tpl of IMPLICIT_ASSUMPTION_TEMPLATES) {
    const match = sentence.match(tpl.pattern);
    if (match) return tpl.toStatement(match, sentence);
  }

  if (/\b(forecast|projected|expected|estimate)\b/i.test(sentence)) {
    return `Projections in the answer assume: ${sentence.replace(/\.$/, "")}`;
  }

  return `The answer assumes: ${sentence.replace(/\.$/, "")}`;
}

export function extractAssumptionCandidates(
  ctx: JudgmentEngineContext
): CandidateAssumption[] {
  const sentences = splitSentences(ctx.answerContent);
  const candidates: CandidateAssumption[] = [];

  for (const sentence of sentences) {
    const matchesPattern = ASSUMPTION_PATTERNS.some((p) => p.test(sentence));
    if (!matchesPattern) continue;

    let baseScore = 0.72;
    for (const tpl of IMPLICIT_ASSUMPTION_TEMPLATES) {
      if (tpl.pattern.test(sentence)) {
        baseScore = Math.max(baseScore, tpl.baseScore);
        break;
      }
    }

    const candidate = sentenceToAssumption(sentence, ctx, baseScore);
    if (candidate) candidates.push(candidate);
  }

  return candidates;
}
