import type {
  CandidateAssumption,
  CandidateRisk,
  CandidateVerification,
  VerificationEffort,
} from "@ttj/phase-1-foundation";
import { createId } from "../utils/id.js";

function effortForText(actionText: string): VerificationEffort {
  const wordCount = actionText.split(/\s+/).length;
  return wordCount > 14 ? "moderate" : "quick";
}

function estimatedMinutes(effort: VerificationEffort): number {
  return effort === "quick" ? 5 : 15;
}

export function verificationForAssumption(
  assumption: CandidateAssumption
): CandidateVerification {
  const actionText = `Confirm whether ${assumption.statement.replace(/^The answer assumes:\s*/i, "").replace(/^It is assumed that\s*/i, "")}`;
  const effort = effortForText(actionText);

  return {
    id: createId("ver"),
    actionText: capitalizeFirst(actionText),
    effort,
    linkedEntityType: "assumption",
    linkedEntityId: assumption.id,
    parentDisplayed: true,
    vagueOrGeneric: false,
    estimatedMinutes: estimatedMinutes(effort),
    duplicatesReadingAnswer: false,
    impactScore: assumption.impactScore * 0.9,
  };
}

export function verificationForRisk(risk: CandidateRisk): CandidateVerification {
  const actionText = `Check whether ${risk.triggerCondition} — validate before acting on this recommendation`;
  const effort = effortForText(actionText);

  return {
    id: createId("ver"),
    actionText: capitalizeFirst(actionText),
    effort,
    linkedEntityType: "risk",
    linkedEntityId: risk.id,
    parentDisplayed: true,
    vagueOrGeneric: false,
    estimatedMinutes: estimatedMinutes(effort),
    duplicatesReadingAnswer: false,
    impactScore: risk.impactScore * 0.88,
  };
}

export function generateVerificationCandidates(
  assumptions: CandidateAssumption[],
  risks: CandidateRisk[]
): CandidateVerification[] {
  const fromAssumptions = assumptions.map(verificationForAssumption);
  const fromRisks = risks.map(verificationForRisk);
  return [...fromAssumptions, ...fromRisks];
}

function capitalizeFirst(text: string): string {
  const trimmed = text.trim();
  if (!trimmed) return trimmed;
  return trimmed.charAt(0).toUpperCase() + trimmed.slice(1);
}
