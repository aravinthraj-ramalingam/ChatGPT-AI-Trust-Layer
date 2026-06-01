import type { JudgmentProvider } from "./types.js";
import { extractAssumptionCandidates } from "../extract/assumption-extractor.js";
import { extractRiskCandidates } from "../extract/risk-extractor.js";
import type { JudgmentEngineContext } from "../types.js";

/** Rule-based provider — no external LLM calls (MVP default) */
export class HeuristicJudgmentProvider implements JudgmentProvider {
  readonly name = "heuristic";

  async extractAssumptions(ctx: JudgmentEngineContext) {
    return extractAssumptionCandidates(ctx);
  }

  async extractRisks(ctx: JudgmentEngineContext) {
    return extractRiskCandidates(ctx);
  }
}

export const defaultProvider = new HeuristicJudgmentProvider();
