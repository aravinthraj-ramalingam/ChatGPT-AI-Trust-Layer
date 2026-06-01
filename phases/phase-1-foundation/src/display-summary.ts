import type {
  Assumption,
  DecisionRisk,
  JudgmentDisplaySummary,
  VerificationAction,
} from "./types.js";

/**
 * Build L1 judgment chip label — Architecture §11 display summary logic.
 * Hide chip when all counts are zero.
 */
export function buildDisplaySummary(
  assumptions: Assumption[],
  risks: DecisionRisk[],
  verifications: VerificationAction[]
): JudgmentDisplaySummary {
  const assumptionCount = assumptions.filter((a) => a.displayed).length;
  const riskCount = risks.filter((r) => r.displayed).length;
  const verificationCount = verifications.filter((v) => v.displayed).length;
  const total = assumptionCount + riskCount + verificationCount;

  if (total === 0) {
    return {
      showChip: false,
      assumptionCount: 0,
      riskCount: 0,
      verificationCount: 0,
      chipLabel: "",
    };
  }

  const segments: string[] = [];
  if (assumptionCount > 0) {
    segments.push(
      `${assumptionCount} assumption${assumptionCount === 1 ? "" : "s"}`
    );
  }
  if (riskCount > 0) {
    segments.push(`${riskCount} risk${riskCount === 1 ? "" : "s"}`);
  }
  if (verificationCount > 0) {
    segments.push("Verify");
  } else if (assumptionCount > 0 || riskCount > 0) {
    segments.push("Verify");
  }

  return {
    showChip: true,
    assumptionCount,
    riskCount,
    verificationCount,
    chipLabel: segments.join(" · "),
  };
}
