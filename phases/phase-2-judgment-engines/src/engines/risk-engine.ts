import type { CandidateRisk } from "@ttj/phase-1-foundation";
import { shouldRunRiskDetection } from "@ttj/phase-1-foundation";
import { dedupeByKey } from "../merge/dedupe.js";
import type { JudgmentProvider } from "../providers/types.js";
import { defaultProvider } from "../providers/heuristic-provider.js";
import type { EngineResult, JudgmentEngineContext } from "../types.js";

export interface RiskEngineOptions {
  provider?: JudgmentProvider;
}

/**
 * Decision Risk Engine — Architecture §10.
 */
export async function runRiskEngine(
  ctx: JudgmentEngineContext,
  options: RiskEngineOptions = {}
): Promise<EngineResult<CandidateRisk>> {
  const { metadata } = ctx;

  if (!shouldRunRiskDetection(metadata.intentClass, metadata.stakesSignal)) {
    return { candidates: [], debug: ["risk_detection_skipped"] };
  }

  const provider = options.provider ?? defaultProvider;
  const raw = await provider.extractRisks(ctx);
  const candidates = dedupeByKey(raw, (r) => r.description);

  return {
    candidates,
    debug: [`provider=${provider.name}`, `raw=${raw.length}`, `deduped=${candidates.length}`],
  };
}
