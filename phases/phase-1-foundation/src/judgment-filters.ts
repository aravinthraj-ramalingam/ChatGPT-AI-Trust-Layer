import { buildDisplaySummary } from "./display-summary.js";
import {
  evaluateJudgmentEligibility,
  shouldRunAssumptionDetection,
  shouldRunRiskDetection,
} from "./eligibility.js";
import { filterAssumptions } from "./filters/assumption-filter.js";
import { filterRisks } from "./filters/risk-filter.js";
import { filterVerifications } from "./filters/verification-filter.js";
import type {
  CandidateAssumption,
  CandidateRisk,
  CandidateVerification,
  FilteredJudgmentItems,
  PromptMetadata,
} from "./types.js";

export interface ApplyJudgmentFiltersInput {
  answerId: string;
  promptContent: string;
  answerContent: string;
  metadata: PromptMetadata;
  policyBlocked?: boolean;
  answerIncomplete?: boolean;
  assumptionCandidates?: CandidateAssumption[];
  riskCandidates?: CandidateRisk[];
  verificationCandidates?: CandidateVerification[];
}

/**
 * End-to-end Phase 1 pipeline: eligibility → filter → summary.
 * Engines (Phase 2) supply candidates; this module applies decision logic.
 */
export function applyJudgmentFilters(
  input: ApplyJudgmentFiltersInput
): FilteredJudgmentItems {
  const eligibility = evaluateJudgmentEligibility({
    promptContent: input.promptContent,
    answerContent: input.answerContent,
    metadata: input.metadata,
    policyBlocked: input.policyBlocked,
    answerIncomplete: input.answerIncomplete,
  });

  if (!eligibility.eligible) {
    return emptyJudgment();
  }

  const { metadata } = input;
  let assumptions: ReturnType<typeof filterAssumptions> = [];
  let risks: ReturnType<typeof filterRisks> = [];
  let verifications: ReturnType<typeof filterVerifications> = [];

  if (
    shouldRunAssumptionDetection(metadata.intentClass, metadata.stakesSignal) &&
    input.assumptionCandidates?.length
  ) {
    assumptions = filterAssumptions(input.assumptionCandidates, {
      answerId: input.answerId,
      promptContent: input.promptContent,
      answerContent: input.answerContent,
      intentClass: metadata.intentClass,
      stakesSignal: metadata.stakesSignal,
    });
  }

  if (
    shouldRunRiskDetection(metadata.intentClass, metadata.stakesSignal) &&
    input.riskCandidates?.length
  ) {
    risks = filterRisks(input.riskCandidates, {
      answerId: input.answerId,
      intentClass: metadata.intentClass,
      stakesSignal: metadata.stakesSignal,
    });
  }

  if (input.verificationCandidates?.length) {
    const displayedParentIds = new Set([
      ...assumptions.map((a) => a.id),
      ...risks.map((r) => r.id),
    ]);
    const withParentFlag = input.verificationCandidates.map((v) => ({
      ...v,
      parentDisplayed: displayedParentIds.has(v.linkedEntityId),
    }));
    verifications = filterVerifications(withParentFlag, {
      answerId: input.answerId,
    });
  }

  const summary = buildDisplaySummary(assumptions, risks, verifications);

  return { assumptions, risks, verifications, summary };
}

function emptyJudgment(): FilteredJudgmentItems {
  const summary = buildDisplaySummary([], [], []);
  return { assumptions: [], risks: [], verifications: [], summary };
}
