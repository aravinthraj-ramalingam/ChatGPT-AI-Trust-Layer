import type { AnswerLayer, GenerateAnswerInput } from "@ttj/phase-3-pipeline";
import {
  TurnOrchestrator,
  shouldShowJudgmentUI,
  type FeatureFlags,
  type JudgmentResult,
} from "@ttj/phase-3-pipeline";

const API_KEY_STORAGE = "ttj_openai_api_key";
const BASE_URL_STORAGE = "ttj_openai_base_url";
const MODEL_STORAGE = "ttj_openai_model";

export type StreamHandler = (partialContent: string) => void;

export function getApiKey(): string {
  return localStorage.getItem(API_KEY_STORAGE) ?? "";
}

export function setApiKey(key: string): void {
  localStorage.setItem(API_KEY_STORAGE, key);
}

export function getBaseUrl(): string {
  return localStorage.getItem(BASE_URL_STORAGE) ?? "https://api.openai.com/v1";
}

export function setBaseUrl(url: string): void {
  localStorage.setItem(BASE_URL_STORAGE, url);
}

export function getModel(): string {
  return localStorage.getItem(MODEL_STORAGE) ?? "gpt-4o-mini";
}

export function setModel(model: string): void {
  localStorage.setItem(MODEL_STORAGE, model);
}

/** Answer layer that calls the serverless /api/chat endpoint with streaming */
export class StreamingAnswerLayer implements AnswerLayer {
  readonly name = "api-streaming";

  constructor(private readonly onStream?: StreamHandler) {}

  async generate(input: GenerateAnswerInput) {
    const apiKey = getApiKey();
    const model = getModel();
    const baseUrl = getBaseUrl();

    try {
      const content = await streamChatCompletion(apiKey, baseUrl, model, input.promptContent, this.onStream);
      return { content };
    } catch (err: unknown) {
      const message = err instanceof Error ? err.message : "Unknown error";
      const fallback = `Error generating answer: ${message}`;
      this.onStream?.(fallback);
      return { content: fallback };
    }
  }
}

async function streamChatCompletion(
  apiKey: string,
  baseUrl: string,
  model: string,
  prompt: string,
  onStream?: StreamHandler,
): Promise<string> {
  const headers: Record<string, string> = {
    "Content-Type": "application/json",
  };
  if (apiKey) {
    headers["x-api-key"] = apiKey;
  }

  const response = await fetch("/api/chat", {
    method: "POST",
    headers,
    body: JSON.stringify({ prompt, model, baseUrl }),
  });

  if (!response.ok) {
    let errorMessage = `API error ${response.status}`;
    try {
      const errJson = await response.json();
      if (errJson.error) errorMessage = errJson.error;
    } catch {
      // ignore parse failure
    }
    throw new Error(errorMessage);
  }

  const reader = response.body?.getReader();
  if (!reader) throw new Error("No response body");

  const decoder = new TextDecoder();
  let accumulated = "";
  let buffer = "";

  while (true) {
    const { done, value } = await reader.read();
    if (done) break;

    buffer += decoder.decode(value, { stream: true });
    const lines = buffer.split("\n");
    buffer = lines.pop() ?? "";

    for (const line of lines) {
      const trimmed = line.trim();
      if (!trimmed || !trimmed.startsWith("data: ")) continue;
      const data = trimmed.slice(6);
      if (data === "[DONE]") return accumulated;

      try {
        const parsed = JSON.parse(data);
        const delta = parsed.choices?.[0]?.delta?.content;
        if (delta) {
          accumulated += delta;
          onStream?.(accumulated);
        }
      } catch {
        // skip malformed chunks
      }
    }
  }

  return accumulated || "No response received.";
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
