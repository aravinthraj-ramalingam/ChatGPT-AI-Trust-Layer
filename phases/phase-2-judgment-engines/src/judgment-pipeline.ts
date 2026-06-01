import {
  applyJudgmentFilters,
  classifyPrompt,
  type CandidateAssumption,
  type CandidateRisk,
  type CandidateVerification,
  type FilteredJudgmentItems,
  type PromptMetadata,
} from "@ttj/phase-1-foundation";
import { runAssumptionEngine } from "./engines/assumption-engine.js";
import { runRiskEngine } from "./engines/risk-engine.js";
import { runVerificationEngine } from "./engines/verification-engine.js";
import { mergeOverlappingCandidates } from "./merge/dedupe.js";
import type { JudgmentProvider } from "./providers/types.js";
import type { JudgmentEngineContext } from "./types.js";

export interface RunJudgmentPipelineInput {
  answerId: string;
  promptContent: string;
  answerContent: string;
  metadata?: PromptMetadata;
  policyBlocked?: boolean;
  answerIncomplete?: boolean;
  provider?: JudgmentProvider;
}

export interface JudgmentPipelineResult extends FilteredJudgmentItems {
  /** Pre-filter candidates (for debugging / eval) */
  raw: {
    assumptions: CandidateAssumption[];
    risks: CandidateRisk[];
    verifications: CandidateVerification[];
  };
  debug: string[];
}

/**
 * Full Phase 2 pipeline: extract → merge → Phase 1 filter → summary.
 */
export async function runJudgmentPipeline(
  input: RunJudgmentPipelineInput
): Promise<JudgmentPipelineResult> {
  const metadata = input.metadata ?? classifyPrompt(input.promptContent);

  const ctx: JudgmentEngineContext = {
    answerId: input.answerId,
    promptContent: input.promptContent,
    answerContent: input.answerContent,
    metadata,
  };

  const [assumptionResult, riskResult] = await Promise.all([
    runAssumptionEngine(ctx, { provider: input.provider }),
    runRiskEngine(ctx, { provider: input.provider }),
  ]);

  const merged = mergeOverlappingCandidates(
    assumptionResult.candidates,
    riskResult.candidates,
    (a) => a.statement,
    (r) => r.description
  );

  const verificationResult = runVerificationEngine(
    merged.assumptions,
    merged.risks
  );

  const filtered = applyJudgmentFilters({
    answerId: input.answerId,
    promptContent: input.promptContent,
    answerContent: input.answerContent,
    metadata,
    policyBlocked: input.policyBlocked,
    answerIncomplete: input.answerIncomplete,
    assumptionCandidates: merged.assumptions,
    riskCandidates: merged.risks,
    verificationCandidates: verificationResult.candidates,
  });

  const debug = [
    ...(assumptionResult.debug ?? []),
    ...(riskResult.debug ?? []),
    ...(verificationResult.debug ?? []),
  ];

  return {
    ...filtered,
    raw: {
      assumptions: merged.assumptions,
      risks: merged.risks,
      verifications: verificationResult.candidates,
    },
    debug,
  };
}
