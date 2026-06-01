import { describe, expect, it } from "vitest";
import { FeedbackEngine, FeedbackValidationError } from "../src/feedback-engine.js";
import { validateFeedbackInput } from "../src/validation.js";
import { runJudgmentForTurn } from "../src/judgment-api.js";

describe("validateFeedbackInput", () => {
  it("accepts layer feedback with comment", () => {
    const result = validateFeedbackInput({
      answerId: "ans_abc123",
      targetType: "layer",
      targetId: null,
      signal: "positive",
      comment: "Very helpful",
    });
    expect(result.ok).toBe(true);
  });

  it("rejects non-layer targets when layerOnly", () => {
    const result = validateFeedbackInput(
      {
        answerId: "ans_abc123",
        targetType: "assumption",
        targetId: "asm_1",
        signal: "positive",
      },
      { layerOnly: true }
    );
    expect(result.ok).toBe(false);
  });
});

describe("FeedbackEngine", () => {
  it("stores and aggregates feedback without PII fields", () => {
    const engine = new FeedbackEngine();
    engine.ingest({
      answerId: "ans_1",
      targetType: "layer",
      targetId: null,
      signal: "positive",
      comment: "Good",
    });
    engine.ingest({
      answerId: "ans_1",
      targetType: "layer",
      targetId: null,
      signal: "negative",
    });

    const agg = engine.getAggregates("ans_1");
    expect(agg.total).toBe(2);
    expect(agg.positive).toBe(1);
    expect(agg.negative).toBe(1);
    expect(agg.byTargetType.layer).toBe(2);
  });

  it("throws on invalid input", () => {
    const engine = new FeedbackEngine();
    expect(() =>
      engine.submit({
        answerId: "",
        targetType: "layer",
        targetId: null,
        signal: "positive",
      })
    ).toThrow(FeedbackValidationError);
  });
});

describe("runJudgmentForTurn", () => {
  it("returns judgment DTO", async () => {
    const longAnswer = "word ".repeat(60);
    const result = await runJudgmentForTurn({
      answerId: "ans_test",
      promptContent: "Should we enter the EU market in 2026?",
      answerContent: longAnswer + " Assuming regulatory clearance completes on schedule.",
    });
    expect(result.answerId).toBe("ans_test");
    expect(result.status).toBe("complete");
  });
});
