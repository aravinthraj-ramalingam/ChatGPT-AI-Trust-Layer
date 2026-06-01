import type { JudgmentPipelineResult } from "@ttj/phase-2-judgment-engines";
import type { JudgmentStatus, PromptMetadata } from "@ttj/phase-1-foundation";
import type { JudgmentResult } from "./types.js";

export function toJudgmentResult(
  answerId: string,
  promptId: string,
  metadata: PromptMetadata,
  pipeline: JudgmentPipelineResult,
  status: JudgmentStatus = "complete"
): JudgmentResult {
  return {
    answerId,
    promptId,
    metadata,
    assumptions: pipeline.assumptions,
    risks: pipeline.risks,
    verifications: pipeline.verifications,
    summary: pipeline.summary,
    status,
    completedAt: status === "complete" ? new Date() : null,
  };
}

export function emptySkippedJudgment(
  answerId: string,
  promptId: string,
  metadata: PromptMetadata
): JudgmentResult {
  return {
    answerId,
    promptId,
    metadata,
    assumptions: [],
    risks: [],
    verifications: [],
    summary: {
      showChip: false,
      assumptionCount: 0,
      riskCount: 0,
      verificationCount: 0,
      chipLabel: "",
    },
    status: "skipped",
    completedAt: new Date(),
  };
}

export function failedJudgment(
  answerId: string,
  promptId: string,
  metadata: PromptMetadata
): JudgmentResult {
  return {
    ...emptySkippedJudgment(answerId, promptId, metadata),
    status: "failed",
    completedAt: new Date(),
  };
}
