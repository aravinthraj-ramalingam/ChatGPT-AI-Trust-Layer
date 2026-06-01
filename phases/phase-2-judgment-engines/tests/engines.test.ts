import { describe, expect, it } from "vitest";
import { classifyPrompt } from "@ttj/phase-1-foundation";
import { runAssumptionEngine } from "../src/engines/assumption-engine.js";
import { runRiskEngine } from "../src/engines/risk-engine.js";
import { runVerificationEngine } from "../src/engines/verification-engine.js";
import { runJudgmentPipeline } from "../src/judgment-pipeline.js";
import { dedupeByKey, mergeOverlappingCandidates } from "../src/merge/dedupe.js";
import {
  chitchatFixture,
  euMarketFixture,
  shortAnswerFixture,
} from "./fixtures/eu-market-decision.js";

describe("assumption engine", () => {
  it("extracts assumptions from conditional answer text", async () => {
    const metadata = classifyPrompt(euMarketFixture.prompt);
    const result = await runAssumptionEngine({
      answerId: "ans-1",
      promptContent: euMarketFixture.prompt,
      answerContent: euMarketFixture.answer,
      metadata,
    });

    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates[0]?.impactScore).toBeGreaterThanOrEqual(0.65);
    expect(result.candidates[0]?.userVerifiable).toBe(true);
  });

  it("skips detection for chitchat", async () => {
    const metadata = classifyPrompt(chitchatFixture.prompt);
    const result = await runAssumptionEngine({
      answerId: "ans-2",
      promptContent: chitchatFixture.prompt,
      answerContent: chitchatFixture.answer,
      metadata,
    });
    expect(result.candidates).toHaveLength(0);
  });
});

describe("risk engine", () => {
  it("extracts decision-changing risks", async () => {
    const metadata = classifyPrompt(euMarketFixture.prompt);
    const result = await runRiskEngine({
      answerId: "ans-1",
      promptContent: euMarketFixture.prompt,
      answerContent: euMarketFixture.answer,
      metadata,
    });

    expect(result.candidates.length).toBeGreaterThan(0);
    expect(result.candidates.some((r) => r.specificToAnswer)).toBe(true);
    expect(result.candidates.every((r) => !r.genericDisclaimer)).toBe(true);
  });
});

describe("verification engine", () => {
  it("generates linked verification actions", async () => {
    const metadata = classifyPrompt(euMarketFixture.prompt);
    const ctx = {
      answerId: "ans-1",
      promptContent: euMarketFixture.prompt,
      answerContent: euMarketFixture.answer,
      metadata,
    };
    const assumptions = (await runAssumptionEngine(ctx)).candidates;
    const risks = (await runRiskEngine(ctx)).candidates;
    const verifications = runVerificationEngine(assumptions, risks);

    expect(verifications.candidates.length).toBeGreaterThan(0);
    expect(verifications.candidates[0]?.actionText.match(/^(Confirm|Check)/)).toBeTruthy();
    expect(verifications.candidates[0]?.linkedEntityId).toBeTruthy();
  });
});

describe("dedupe and merge", () => {
  it("dedupes similar statements", () => {
    const items = [
      { id: "1", statement: "FX rates remain stable through launch period", impactScore: 0.8 },
      { id: "2", statement: "FX rates remain stable through the launch period", impactScore: 0.7 },
    ];
    const deduped = dedupeByKey(items, (i) => i.statement);
    expect(deduped).toHaveLength(1);
  });

  it("drops risks that duplicate assumptions", () => {
    const assumptions = [
      {
        id: "a1",
        statement: "Regulatory clearance completes before launch",
        impactScore: 0.9,
      },
    ];
    const risks = [
      {
        id: "r1",
        description: "Regulatory clearance completes before launch",
        impactScore: 0.85,
      },
      {
        id: "r2",
        description: "Tariff policy shifts in 2026",
        impactScore: 0.8,
      },
    ];
    const merged = mergeOverlappingCandidates(
      assumptions,
      risks,
      (a) => a.statement,
      (r) => r.description
    );
    expect(merged.assumptions).toHaveLength(1);
    expect(merged.risks).toHaveLength(1);
    expect(merged.risks[0]?.description).toContain("Tariff");
  });
});

describe("runJudgmentPipeline", () => {
  it("returns filtered judgment with chip for EU market fixture", async () => {
    const result = await runJudgmentPipeline({
      answerId: "ans-eu",
      promptContent: euMarketFixture.prompt,
      answerContent: euMarketFixture.answer,
    });

    expect(result.raw.assumptions.length).toBeGreaterThan(0);
    expect(result.summary.showChip).toBe(true);
    expect(result.assumptions.length).toBeLessThanOrEqual(3);
    expect(result.risks.length).toBeLessThanOrEqual(3);
    expect(result.verifications.length).toBeLessThanOrEqual(3);
    expect(result.summary.chipLabel).toMatch(/assumption|risk|Verify/i);
  });

  it("returns empty judgment for chitchat", async () => {
    const result = await runJudgmentPipeline({
      answerId: "ans-hi",
      promptContent: chitchatFixture.prompt,
      answerContent: chitchatFixture.answer,
    });

    expect(result.summary.showChip).toBe(false);
    expect(result.assumptions).toHaveLength(0);
  });

  it("returns empty judgment for short answers", async () => {
    const result = await runJudgmentPipeline({
      answerId: "ans-short",
      promptContent: shortAnswerFixture.prompt,
      answerContent: shortAnswerFixture.answer,
    });

    expect(result.summary.showChip).toBe(false);
  });
});
