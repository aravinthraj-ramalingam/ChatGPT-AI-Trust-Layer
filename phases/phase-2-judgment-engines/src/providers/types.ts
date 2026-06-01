import type {
  CandidateAssumption,
  CandidateRisk,
  CandidateVerification,
} from "@ttj/phase-1-foundation";
import type { JudgmentEngineContext } from "../types.js";

/** Pluggable extraction backend (heuristic MVP default; LLM in future) */
export interface JudgmentProvider {
  readonly name: string;
  extractAssumptions(ctx: JudgmentEngineContext): Promise<CandidateAssumption[]>;
  extractRisks(ctx: JudgmentEngineContext): Promise<CandidateRisk[]>;
}

export interface JudgmentProviderResult {
  assumptions: CandidateAssumption[];
  risks: CandidateRisk[];
  verifications: CandidateVerification[];
}
