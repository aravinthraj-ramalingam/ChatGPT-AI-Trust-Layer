export interface GenerateAnswerInput {
  conversationId: string;
  promptId: string;
  promptContent: string;
}

export interface GenerateAnswerOutput {
  content: string;
  policyBlocked?: boolean;
  incomplete?: boolean;
}

/**
 * Answer Layer adapter — Architecture §10.
 * Replace StubAnswerLayer with ChatGPT integration in production.
 */
export interface AnswerLayer {
  readonly name: string;
  generate(input: GenerateAnswerInput): Promise<GenerateAnswerOutput>;
}
