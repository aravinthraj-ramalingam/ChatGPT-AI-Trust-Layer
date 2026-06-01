import { classifyPrompt } from "@ttj/phase-1-foundation";
import { runJudgmentPipeline } from "@ttj/phase-2-judgment-engines";
import { toJudgmentResult } from "@ttj/phase-3-pipeline";
import type { JudgmentResult } from "@ttj/phase-3-pipeline";
import type { RunJudgmentInput } from "./types.js";

export interface JudgmentApiStore {
  get(answerId: string): JudgmentResult | undefined;
  set(answerId: string, result: JudgmentResult): void;
}

export class InMemoryJudgmentApiStore implements JudgmentApiStore {
  private readonly map = new Map<string, JudgmentResult>();

  get(answerId: string): JudgmentResult | undefined {
    return this.map.get(answerId);
  }

  set(answerId: string, result: JudgmentResult): void {
    this.map.set(answerId, result);
  }
}

/** Run judgment pipeline and return presentation DTO */
export async function runJudgmentForTurn(
  input: RunJudgmentInput,
  store?: JudgmentApiStore
): Promise<JudgmentResult> {
  const metadata = input.metadata ?? classifyPrompt(input.promptContent);

  const pipeline = await runJudgmentPipeline({
    answerId: input.answerId,
    promptContent: input.promptContent,
    answerContent: input.answerContent,
    metadata,
  });

  const result = toJudgmentResult(
    input.answerId,
    input.promptId ?? input.answerId,
    metadata,
    pipeline,
    "complete"
  );

  store?.set(input.answerId, result);
  return result;
}
