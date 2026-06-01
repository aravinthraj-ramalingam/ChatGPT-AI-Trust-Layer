import type {
  Feedback,
  FeedbackSignal,
  FeedbackTargetType,
  PromptMetadata,
} from "@ttj/phase-1-foundation";

export interface SubmitFeedbackInput {
  answerId: string;
  targetType: FeedbackTargetType;
  targetId: string | null;
  signal: FeedbackSignal;
  comment?: string;
}

export interface FeedbackValidationResult {
  ok: true;
  data: SubmitFeedbackInput;
}

export interface InvalidFeedbackResult {
  ok: false;
  errors: string[];
}

export type ValidateFeedbackResult =
  | FeedbackValidationResult
  | InvalidFeedbackResult;

export interface FeedbackAggregate {
  total: number;
  positive: number;
  negative: number;
  withComment: number;
  byTargetType: Record<FeedbackTargetType, number>;
}

export interface RunJudgmentInput {
  answerId: string;
  promptId?: string;
  promptContent: string;
  answerContent: string;
  metadata?: PromptMetadata;
}

export type { Feedback };
