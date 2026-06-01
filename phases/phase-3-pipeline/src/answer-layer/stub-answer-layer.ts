import type { AnswerLayer, GenerateAnswerInput, GenerateAnswerOutput } from "./types.js";

export type StubResponder = (promptContent: string) => string;

/**
 * MVP answer generator — returns static or callback-produced content.
 */
export class StubAnswerLayer implements AnswerLayer {
  readonly name = "stub";

  constructor(private readonly responder?: StubResponder) {}

  async generate(input: GenerateAnswerInput): Promise<GenerateAnswerOutput> {
    const content =
      this.responder?.(input.promptContent) ??
      `This is a stub answer for: ${input.promptContent}`;

    return { content };
  }
}

export const defaultStubAnswerLayer = new StubAnswerLayer();
