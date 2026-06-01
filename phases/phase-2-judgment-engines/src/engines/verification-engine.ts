import type {
  CandidateAssumption,
  CandidateRisk,
  CandidateVerification,
} from "@ttj/phase-1-foundation";
import { generateVerificationCandidates } from "../extract/verification-extractor.js";
import { dedupeByKey } from "../merge/dedupe.js";
import type { EngineResult } from "../types.js";

/**
 * Verification Engine — Architecture §10.
 * Generates actionable checks from assumption and risk candidates.
 */
export function runVerificationEngine(
  assumptions: CandidateAssumption[],
  risks: CandidateRisk[]
): EngineResult<CandidateVerification> {
  const raw = generateVerificationCandidates(assumptions, risks);
  const candidates = dedupeByKey(raw, (v) => v.actionText);

  return {
    candidates,
    debug: [`raw=${raw.length}`, `deduped=${candidates.length}`],
  };
}
