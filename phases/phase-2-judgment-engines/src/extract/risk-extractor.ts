import type { CandidateRisk, StakesSignal } from "@ttj/phase-1-foundation";
import { createId } from "../utils/id.js";
import { splitSentences } from "../utils/sentences.js";
import type { JudgmentEngineContext } from "../types.js";

const RISK_PATTERNS: RegExp[] = [
  /\b(risk|uncertain|volatil|delay|slip|fail|blocker|headwind)\b/i,
  /\b(however|although|unless|could change|may change|might change)\b/i,
  /\b(regulat|approval|compliance|tariff|sanction|legal)\b/i,
  /\b(outdated|obsolete|superseded|no longer)\b/i,
];

const RISK_TEMPLATES: Array<{
  pattern: RegExp;
  description: (s: string) => string;
  trigger: (s: string) => string;
  impact: (s: string) => string;
  baseScore: number;
}> = [
  {
    pattern: /\b(delay|slip|postpone)\w*\b/i,
    description: () => "Timeline slips beyond the planned window",
    trigger: (s) => extractTrigger(s, "delay"),
    impact: () => "Delay or narrow the recommended action",
    baseScore: 0.84,
  },
  {
    pattern: /\b(regulat|approval|compliance)\w*\b/i,
    description: () => "Regulatory or compliance requirements change",
    trigger: (s) => extractTrigger(s, "regulatory"),
    impact: () => "Revise the plan or halt execution until cleared",
    baseScore: 0.86,
  },
  {
    pattern: /\b(tariff|sanction|trade)\w*\b/i,
    description: () => "Trade or tariff policy shifts",
    trigger: (s) => extractTrigger(s, "trade"),
    impact: () => "Re-evaluate pricing, timing, or market entry",
    baseScore: 0.83,
  },
];

function extractTrigger(sentence: string, _kind: string): string {
  const trimmed = sentence.replace(/\.$/, "").trim();
  if (trimmed.length > 100) return `${trimmed.slice(0, 97)}...`;
  return trimmed;
}

function stakesBoost(stakes: StakesSignal): number {
  if (stakes === "very_high") return 0.08;
  if (stakes === "high") return 0.06;
  if (stakes === "medium") return 0.03;
  return 0;
}

function sentenceToRisk(
  sentence: string,
  ctx: JudgmentEngineContext
): CandidateRisk | null {
  if (!RISK_PATTERNS.some((p) => p.test(sentence))) return null;

  let description = `A change related to this answer could occur: ${sentence.replace(/\.$/, "")}`;
  let triggerCondition = sentence.replace(/\.$/, "");
  let decisionImpact = "Revisit the recommendation before committing resources";
  let baseScore = 0.74;

  for (const tpl of RISK_TEMPLATES) {
    if (tpl.pattern.test(sentence)) {
      description = tpl.description(sentence);
      triggerCondition = tpl.trigger(sentence);
      decisionImpact = tpl.impact(sentence);
      baseScore = tpl.baseScore;
      break;
    }
  }

  const impactScore = Math.min(
    0.95,
    baseScore + stakesBoost(ctx.metadata.stakesSignal)
  );

  return {
    id: createId("risk"),
    description,
    triggerCondition,
    decisionImpact,
    impactScore,
    genericDisclaimer: false,
    specificToAnswer: true,
    wouldChangeAction: ctx.metadata.stakesSignal !== "low",
    showReason:
      "If this occurs, you may need to change your decision before acting on the answer.",
  };
}

export function extractRiskCandidates(
  ctx: JudgmentEngineContext
): CandidateRisk[] {
  const sentences = splitSentences(ctx.answerContent);
  const candidates: CandidateRisk[] = [];

  for (const sentence of sentences) {
    const risk = sentenceToRisk(sentence, ctx);
    if (risk) candidates.push(risk);
  }

  return candidates;
}
