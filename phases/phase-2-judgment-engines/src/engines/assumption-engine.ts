import type { CandidateAssumption } from "@ttj/phase-1-foundation";
import {
  shouldRunAssumptionDetection,
} from "@ttj/phase-1-foundation";
import { dedupeByKey } from "../merge/dedupe.js";
import type { JudgmentProvider } from "../providers/types.js";
import { defaultProvider } from "../providers/heuristic-provider.js";
import type { EngineResult, JudgmentEngineContext } from "../types.js";

export interface AssumptionEngineOptions {
  provider?: JudgmentProvider;
}

/**
 * Assumption Engine — Architecture §10.
 * Extracts candidate assumptions; Phase 1 filters decide display.
 */
export async function runAssumptionEngine(
  ctx: JudgmentEngineContext,
  options: AssumptionEngineOptions = {}
): Promise<EngineResult<CandidateAssumption>> {
  const { metadata } = ctx;

  if (!shouldRunAssumptionDetection(metadata.intentClass, metadata.stakesSignal)) {
    return { candidates: [], debug: ["assumption_detection_skipped"] };
  }

  const provider = options.provider ?? defaultProvider;
  const raw = await provider.extractAssumptions(ctx);
  const candidates = dedupeByKey(raw, (a) => a.statement);

  return {
    candidates,
    debug: [`provider=${provider.name}`, `raw=${raw.length}`, `deduped=${candidates.length}`],
  };
}
