import type {
  Answer,
  Assumption,
  DecisionRisk,
  JudgmentDisplaySummary,
  JudgmentStatus,
  Prompt,
  PromptMetadata,
  VerificationAction,
} from "@ttj/phase-1-foundation";

/** Presentation-ready judgment artifact — Architecture §10 */
export interface JudgmentResult {
  answerId: string;
  promptId: string;
  metadata: PromptMetadata;
  assumptions: Assumption[];
  risks: DecisionRisk[];
  verifications: VerificationAction[];
  summary: JudgmentDisplaySummary;
  status: JudgmentStatus;
  completedAt: Date | null;
}

export type JudgmentState =
  | "disabled"
  | "pending"
  | "complete"
  | "failed"
  | "skipped";

/** Immediate turn result (answer-first); judgment may arrive later */
export interface TurnResult {
  prompt: Prompt;
  answer: Answer;
  judgment: JudgmentResult | null;
  judgmentState: JudgmentState;
}

export interface RegenerateTurnInput {
  conversationId: string;
  promptId: string;
  previousAnswerId: string;
  promptContent: string;
}
