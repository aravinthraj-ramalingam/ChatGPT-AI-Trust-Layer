import { afterEach, describe, expect, it } from "vitest";
import { StubAnswerLayer } from "../src/answer-layer/stub-answer-layer.js";
import {
  isJudgmentActive,
  resolveFeatureFlags,
  shouldShowJudgmentUI,
} from "../src/feature-flags.js";
import { InMemoryJudgmentStore } from "../src/judgment-store.js";
import { TurnOrchestrator } from "../src/turn-orchestrator.js";
import { euMarketAnswer, euMarketPrompt } from "./fixtures.js";

describe("feature flags", () => {
  it("disables judgment when kill switch is on", () => {
    const flags = resolveFeatureFlags({
      trustThroughJudgmentEnabled: true,
      judgmentKillSwitch: true,
    });
    expect(isJudgmentActive(flags)).toBe(false);
  });

  it("hides UI when feature off", () => {
    const flags = resolveFeatureFlags({
      trustThroughJudgmentEnabled: false,
      judgmentKillSwitch: false,
    });
    expect(shouldShowJudgmentUI(flags, true)).toBe(false);
  });
});

describe("TurnOrchestrator integration", () => {
  const store = new InMemoryJudgmentStore();

  afterEach(() => store.clear());

  function createOrchestrator() {
    return new TurnOrchestrator({
      answerLayer: new StubAnswerLayer(() => euMarketAnswer),
      judgmentStore: store,
    });
  }

  it("returns answer first with pending judgment", async () => {
    const orchestrator = createOrchestrator();
    const turn = await orchestrator.executeTurn({
      conversationId: "conv-1",
      promptContent: euMarketPrompt,
    });

    expect(turn.answer.content).toBe(euMarketAnswer);
    expect(turn.judgmentState).toBe("pending");
    expect(turn.judgment).toBeNull();
  });

  it("completes full prompt → answer → judgment flow", async () => {
    const orchestrator = createOrchestrator();
    const turn = await orchestrator.executeTurn({
      conversationId: "conv-1",
      promptContent: euMarketPrompt,
      awaitJudgment: true,
    });

    expect(turn.judgmentState).toBe("complete");
    expect(turn.judgment).not.toBeNull();
    expect(turn.judgment!.summary.showChip).toBe(true);
    expect(turn.judgment!.assumptions.length).toBeGreaterThan(0);
    expect(store.has(turn.answer.id)).toBe(true);
  });

  it("fail-open: stores failed judgment without throwing", async () => {
    const orchestrator = new TurnOrchestrator({
      answerLayer: new StubAnswerLayer(() => "short"),
      judgmentStore: store,
    });

    const turn = await orchestrator.executeTurn({
      conversationId: "conv-2",
      promptContent: euMarketPrompt,
      awaitJudgment: true,
    });

    expect(turn.answer.content).toBe("short");
    expect(["skipped", "disabled", "complete", "failed"]).toContain(
      turn.judgmentState
    );
  });

  it("skips judgment when feature disabled", async () => {
    const orchestrator = createOrchestrator();
    const turn = await orchestrator.executeTurn({
      conversationId: "conv-3",
      promptContent: euMarketPrompt,
      featureFlags: { trustThroughJudgmentEnabled: false },
      awaitJudgment: true,
    });

    expect(turn.judgmentState).toBe("disabled");
    expect(turn.judgment).toBeNull();
  });

  it("regenerate creates new answer and replaces judgment", async () => {
    const orchestrator = createOrchestrator();
    const first = await orchestrator.executeTurn({
      conversationId: "conv-4",
      promptContent: euMarketPrompt,
      awaitJudgment: true,
    });

    expect(store.has(first.answer.id)).toBe(true);

    const second = await orchestrator.regenerateTurn({
      conversationId: "conv-4",
      promptId: first.prompt.id,
      previousAnswerId: first.answer.id,
      promptContent: euMarketPrompt,
    });

    expect(second.answer.id).not.toBe(first.answer.id);
    expect(store.has(first.answer.id)).toBe(false);
    expect(store.has(second.answer.id)).toBe(true);
    expect(second.judgment?.status).toBe("complete");
  });

  it("notifies listeners when judgment completes", async () => {
    const orchestrator = createOrchestrator();
    let notified: string | null = null;

    const turn = await orchestrator.executeTurn({
      conversationId: "conv-5",
      promptContent: euMarketPrompt,
    });

    const done = new Promise<void>((resolve) => {
      orchestrator.onJudgmentComplete(turn.answer.id, (j) => {
        notified = j.answerId;
        resolve();
      });
    });

    await orchestrator.waitForJudgment(turn.answer.id, 5000);
    await done;

    expect(notified).toBe(turn.answer.id);
  });
});

describe("InMemoryJudgmentStore", () => {
  it("stores and deletes by answer id", () => {
    const store = new InMemoryJudgmentStore();
    const result = {
      answerId: "ans-1",
      promptId: "prm-1",
      metadata: { intentClass: "decision" as const, stakesSignal: "high" as const },
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
      status: "complete" as const,
      completedAt: new Date(),
    };
    store.set("ans-1", result);
    expect(store.get("ans-1")).toEqual(result);
    expect(store.delete("ans-1")).toBe(true);
    expect(store.get("ans-1")).toBeUndefined();
  });
});
