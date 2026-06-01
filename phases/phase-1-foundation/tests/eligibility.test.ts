import { describe, expect, it } from "vitest";
import {
  evaluateJudgmentEligibility,
  estimateTokenCount,
} from "../src/eligibility.js";

const longAnswer = "word ".repeat(60);

describe("evaluateJudgmentEligibility", () => {
  it("rejects chitchat", () => {
    const result = evaluateJudgmentEligibility({
      promptContent: "hi",
      answerContent: longAnswer,
      metadata: { intentClass: "chitchat", stakesSignal: "low" },
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("chitchat");
  });

  it("rejects short answers", () => {
    const result = evaluateJudgmentEligibility({
      promptContent: "Should we expand?",
      answerContent: "Yes.",
      metadata: { intentClass: "decision", stakesSignal: "high" },
    });
    expect(result.eligible).toBe(false);
    expect(result.reason).toBe("answer_too_short");
  });

  it("rejects informational + low stakes", () => {
    const result = evaluateJudgmentEligibility({
      promptContent: "What is GDP?",
      answerContent: longAnswer,
      metadata: { intentClass: "informational", stakesSignal: "low" },
    });
    expect(result.eligible).toBe(false);
  });

  it("accepts decision + high stakes", () => {
    const result = evaluateJudgmentEligibility({
      promptContent: "Should we invest?",
      answerContent: longAnswer,
      metadata: { intentClass: "decision", stakesSignal: "high" },
    });
    expect(result.eligible).toBe(true);
  });
});

describe("estimateTokenCount", () => {
  it("returns 0 for empty", () => {
    expect(estimateTokenCount("")).toBe(0);
  });
});
