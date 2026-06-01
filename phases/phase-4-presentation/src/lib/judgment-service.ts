import type { AnswerLayer, GenerateAnswerInput } from "@ttj/phase-3-pipeline";
import {
  TurnOrchestrator,
  shouldShowJudgmentUI,
  type FeatureFlags,
  type JudgmentResult,
  type TurnResult,
} from "@ttj/phase-3-pipeline";
import { DEMO_ANSWER } from "./demo-content.js";

export type StreamHandler = (partialContent: string) => void;

/** Answer layer with simulated streaming for Screen 2 */
export class StreamingAnswerLayer implements AnswerLayer {
  readonly name = "streaming-stub";

  constructor(
    private readonly onStream?: StreamHandler,
    private readonly fullText: string = DEMO_ANSWER
  ) {}

  async generate(input: GenerateAnswerInput) {
    const words = this.fullText.split(/\s+/);
    let accumulated = "";

    for (const word of words) {
      accumulated = accumulated ? `${accumulated} ${word}` : word;
      this.onStream?.(accumulated);
      await delay(28);
    }

    if (input.promptContent.length < 3) {
      return { content: "Please provide more detail in your prompt." };
    }

    return { content: this.fullText };
  }
}

export function createOrchestrator(onStream?: StreamHandler): TurnOrchestrator {
  return new TurnOrchestrator({
    answerLayer: new StreamingAnswerLayer(onStream),
  });
}

export async function waitForJudgmentResult(
  orchestrator: TurnOrchestrator,
  answerId: string,
  timeoutMs = 8000
): Promise<JudgmentResult | null> {
  return orchestrator.waitForJudgment(answerId, timeoutMs);
}

export function canShowJudgmentChip(
  flags: FeatureFlags,
  judgment: JudgmentResult | null
): boolean {
  if (!judgment) return false;
  return shouldShowJudgmentUI(flags, judgment.summary.showChip);
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
