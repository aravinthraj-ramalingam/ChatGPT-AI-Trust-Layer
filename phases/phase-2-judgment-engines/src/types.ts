import type { PromptMetadata } from "@ttj/phase-1-foundation";

/** Shared input for all judgment engines */
export interface JudgmentEngineContext {
  answerId: string;
  promptContent: string;
  answerContent: string;
  metadata: PromptMetadata;
}

export interface EngineResult<T> {
  candidates: T[];
  /** Engine-level notes for debugging (not shown to users) */
  debug?: string[];
}
