import {
  classifyPrompt,
  evaluateJudgmentEligibility,
} from "@ttj/phase-1-foundation";
import type { Answer, Prompt, PromptMetadata } from "@ttj/phase-1-foundation";
import {
  runJudgmentPipeline,
  type JudgmentProvider,
} from "@ttj/phase-2-judgment-engines";
import type { AnswerLayer } from "./answer-layer/types.js";
import { defaultStubAnswerLayer } from "./answer-layer/stub-answer-layer.js";
import {
  type FeatureFlags,
  isJudgmentActive,
  resolveFeatureFlags,
} from "./feature-flags.js";
import {
  failedJudgment,
  emptySkippedJudgment,
  toJudgmentResult,
} from "./judgment-result-mapper.js";
import type { JudgmentStore } from "./judgment-store.js";
import { InMemoryJudgmentStore } from "./judgment-store.js";
import { createId } from "./ids.js";
import type {
  JudgmentResult,
  JudgmentState,
  RegenerateTurnInput,
  TurnResult,
} from "./types.js";

export interface ExecuteTurnInput {
  conversationId: string;
  promptContent: string;
  /** User-confirmed metadata (stakes override auto-detection) */
  metadata?: PromptMetadata;
  featureFlags?: Partial<FeatureFlags>;
  /** When true, blocks until judgment completes or times out (tests) */
  awaitJudgment?: boolean;
  judgmentTimeoutMs?: number;
}

export interface TurnOrchestratorOptions {
  answerLayer?: AnswerLayer;
  judgmentStore?: JudgmentStore;
  featureFlags?: Partial<FeatureFlags>;
  judgmentProvider?: JudgmentProvider;
  defaultJudgmentTimeoutMs?: number;
}

type JudgmentListener = (result: JudgmentResult) => void;

/**
 * Answer-first turn orchestrator — Architecture §8 / §10.
 * Fail-open: answer always returned; judgment errors do not block.
 */
export class TurnOrchestrator {
  private readonly answerLayer: AnswerLayer;
  private readonly store: JudgmentStore;
  private readonly flags: FeatureFlags;
  private readonly judgmentProvider?: JudgmentProvider;
  private readonly defaultTimeoutMs: number;
  private readonly listeners = new Map<string, Set<JudgmentListener>>();

  constructor(options: TurnOrchestratorOptions = {}) {
    this.answerLayer = options.answerLayer ?? defaultStubAnswerLayer;
    this.store = options.judgmentStore ?? new InMemoryJudgmentStore();
    this.flags = resolveFeatureFlags(options.featureFlags);
    this.judgmentProvider = options.judgmentProvider;
    this.defaultTimeoutMs = options.defaultJudgmentTimeoutMs ?? 8000;
  }

  getFeatureFlags(): FeatureFlags {
    return { ...this.flags };
  }

  getJudgmentStore(): JudgmentStore {
    return this.store;
  }

  /** Process prompt → answer (immediate) → judgment (async) */
  async executeTurn(input: ExecuteTurnInput): Promise<TurnResult> {
    const flags = resolveFeatureFlags({
      ...this.flags,
      ...input.featureFlags,
    });
    const metadata =
      input.metadata ?? classifyPrompt(input.promptContent);
    const prompt = this.createPrompt(input.conversationId, input.promptContent, metadata);
    const promptId = prompt.id;

    const generated = await this.answerLayer.generate({
      conversationId: input.conversationId,
      promptId,
      promptContent: input.promptContent,
    });

    const eligibility = evaluateJudgmentEligibility({
      promptContent: input.promptContent,
      answerContent: generated.content,
      metadata,
      policyBlocked: generated.policyBlocked,
      answerIncomplete: generated.incomplete,
    });

    const judgmentActive = isJudgmentActive(flags) && eligibility.eligible;

    const answer = this.createAnswer(
      promptId,
      generated.content,
      judgmentActive ? "pending" : "skipped",
      eligibility.eligible && isJudgmentActive(flags)
    );

    let judgmentState: JudgmentState = judgmentActive ? "pending" : "disabled";
    if (!isJudgmentActive(flags)) {
      judgmentState = "disabled";
    } else if (!eligibility.eligible) {
      judgmentState = "skipped";
      const skipped = emptySkippedJudgment(answer.id, promptId, metadata);
      this.store.set(answer.id, skipped);
    }

    const immediate: TurnResult = {
      prompt,
      answer: { ...answer },
      judgment: judgmentState === "skipped" ? this.store.get(answer.id) ?? null : null,
      judgmentState,
    };

    if (!judgmentActive) {
      return immediate;
    }

    const judgmentPromise = this.runJudgmentAsync({
      answer,
      promptId,
      promptContent: input.promptContent,
      answerContent: generated.content,
      metadata,
      policyBlocked: generated.policyBlocked,
      answerIncomplete: generated.incomplete,
    });

    if (input.awaitJudgment) {
      const timeout = input.judgmentTimeoutMs ?? this.defaultTimeoutMs;
      const result = await this.waitForJudgment(answer.id, timeout, judgmentPromise);
      return {
        prompt,
        answer: {
          ...answer,
          judgmentStatus: result?.status ?? "failed",
          judgmentEligible: true,
        },
        judgment: result,
        judgmentState: result?.status === "complete" ? "complete" : "failed",
      };
    }

    void judgmentPromise;
    return immediate;
  }

  /** Regenerate: new answer artifact; prior judgment removed — Architecture §3.5 */
  async regenerateTurn(input: RegenerateTurnInput): Promise<TurnResult> {
    this.store.delete(input.previousAnswerId);
    return this.executeTurn({
      conversationId: input.conversationId,
      promptContent: input.promptContent,
      awaitJudgment: true,
    });
  }

  getJudgment(answerId: string): JudgmentResult | undefined {
    return this.store.get(answerId);
  }

  onJudgmentComplete(answerId: string, listener: JudgmentListener): () => void {
    if (!this.listeners.has(answerId)) {
      this.listeners.set(answerId, new Set());
    }
    this.listeners.get(answerId)!.add(listener);
    return () => this.listeners.get(answerId)?.delete(listener);
  }

  async waitForJudgment(
    answerId: string,
    timeoutMs: number = this.defaultTimeoutMs,
    inFlight?: Promise<JudgmentResult | void>
  ): Promise<JudgmentResult | null> {
    const existing = this.store.get(answerId);
    if (existing && existing.status !== "pending") {
      return existing;
    }

    if (inFlight) {
      await Promise.race([
        inFlight,
        delay(timeoutMs).then(() => {
          throw new Error("judgment_timeout");
        }),
      ]).catch(() => undefined);
      return this.store.get(answerId) ?? null;
    }

    const deadline = Date.now() + timeoutMs;
    while (Date.now() < deadline) {
      const current = this.store.get(answerId);
      if (current && current.status !== "pending") {
        return current;
      }
      await delay(25);
    }
    return this.store.get(answerId) ?? null;
  }

  private async runJudgmentAsync(params: {
    answer: Answer;
    promptId: string;
    promptContent: string;
    answerContent: string;
    metadata: PromptMetadata;
    policyBlocked?: boolean;
    answerIncomplete?: boolean;
  }): Promise<void> {
    const { answer, promptId, metadata } = params;

    try {
      const pipeline = await runJudgmentPipeline({
        answerId: answer.id,
        promptContent: params.promptContent,
        answerContent: params.answerContent,
        metadata,
        policyBlocked: params.policyBlocked,
        answerIncomplete: params.answerIncomplete,
        provider: this.judgmentProvider,
      });

      const result = toJudgmentResult(
        answer.id,
        promptId,
        metadata,
        pipeline,
        "complete"
      );
      this.store.set(answer.id, result);
      answer.judgmentStatus = "complete";
      this.emit(answer.id, result);
    } catch {
      const failed = failedJudgment(answer.id, promptId, metadata);
      this.store.set(answer.id, failed);
      answer.judgmentStatus = "failed";
      this.emit(answer.id, failed);
    }
  }

  private emit(answerId: string, result: JudgmentResult): void {
    for (const listener of this.listeners.get(answerId) ?? []) {
      listener(result);
    }
  }

  private createPrompt(
    conversationId: string,
    content: string,
    metadata: PromptMetadata
  ): Prompt {
    return {
      id: createId("prm"),
      conversationId,
      content,
      intentClass: metadata.intentClass,
      stakesSignal: metadata.stakesSignal,
      createdAt: new Date(),
    };
  }

  private createAnswer(
    promptId: string,
    content: string,
    judgmentStatus: Answer["judgmentStatus"],
    judgmentEligible: boolean
  ): Answer {
    return {
      id: createId("ans"),
      promptId,
      content,
      judgmentEligible,
      judgmentStatus,
      createdAt: new Date(),
    };
  }
}

function delay(ms: number): Promise<void> {
  return new Promise((resolve) => setTimeout(resolve, ms));
}
