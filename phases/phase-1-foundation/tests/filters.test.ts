import { describe, expect, it } from "vitest";
import { shouldShowAssumption, filterAssumptions } from "../src/filters/assumption-filter.js";
import { shouldShowRisk, filterRisks, isGenericDisclaimer } from "../src/filters/risk-filter.js";
import {
  shouldShowVerification,
  filterVerifications,
  isVagueVerification,
} from "../src/filters/verification-filter.js";
import { buildDisplaySummary } from "../src/display-summary.js";
import { applyJudgmentFilters } from "../src/judgment-filters.js";
import type {
  CandidateAssumption,
  CandidateRisk,
  CandidateVerification,
} from "../src/types.js";

const ctx = {
  answerId: "ans-1",
  promptContent: "Should we enter the EU market in 2026?",
  answerContent:
    "Entering the EU market in 2026 is viable if regulatory clearance completes on schedule and demand holds in your target segment. Revenue projections assume stable FX and no major tariff changes.",
  intentClass: "decision" as const,
  stakesSignal: "high" as const,
};

describe("assumption filter", () => {
  const strong: CandidateAssumption = {
    id: "a1",
    statement: "Regulatory clearance completes before launch",
    impactScore: 0.9,
    explicitInPromptOrAnswer: false,
    trivialOrUniversal: false,
    changesCorrectnessOrApplicability: true,
    userVerifiable: true,
  };

  it("hides low impact", () => {
    expect(shouldShowAssumption({ ...strong, impactScore: 0.5 }, ctx)).toBe(
      false
    );
  });

  it("hides trivial premises", () => {
    expect(
      shouldShowAssumption(
        {
          ...strong,
          statement: "Companies want to profit",
          trivialOrUniversal: true,
        },
        ctx
      )
    ).toBe(false);
  });

  it("caps at 3 assumptions", () => {
    const candidates = [1, 2, 3, 4].map((n) => ({
      ...strong,
      id: `a${n}`,
      statement: `Unique assumption number ${n} about market conditions`,
      impactScore: 0.9 - n * 0.05,
    }));
    expect(filterAssumptions(candidates, ctx)).toHaveLength(3);
  });
});

describe("risk filter", () => {
  const strong: CandidateRisk = {
    id: "r1",
    description: "EU tariff policy changes before launch",
    triggerCondition: "New tariffs announced in 2026",
    decisionImpact: "Delay market entry or revise pricing",
    impactScore: 0.85,
    genericDisclaimer: false,
    specificToAnswer: true,
    wouldChangeAction: true,
  };

  it("blocks generic disclaimers", () => {
    expect(isGenericDisclaimer("AI may make mistakes")).toBe(true);
    expect(
      shouldShowRisk(
        {
          ...strong,
          genericDisclaimer: true,
          description: "AI may make mistakes",
        },
        ctx
      )
    ).toBe(false);
  });

  it("hides informational low stakes", () => {
    expect(
      shouldShowRisk(strong, {
        ...ctx,
        intentClass: "informational",
        stakesSignal: "low",
      })
    ).toBe(false);
  });
});

describe("verification filter", () => {
  const valid: CandidateVerification = {
    id: "v1",
    actionText: "Confirm current EU tariff schedule on your product category",
    effort: "quick",
    linkedEntityType: "risk",
    linkedEntityId: "r1",
    parentDisplayed: true,
    vagueOrGeneric: false,
    estimatedMinutes: 5,
    duplicatesReadingAnswer: false,
    impactScore: 0.8,
  };

  it("blocks vague actions", () => {
    expect(isVagueVerification("be careful")).toBe(true);
    expect(shouldShowVerification({ ...valid, actionText: "be careful" })).toBe(
      false
    );
  });

  it("requires displayed parent", () => {
    expect(shouldShowVerification({ ...valid, parentDisplayed: false })).toBe(
      false
    );
  });
});

describe("display summary", () => {
  it("hides chip when empty", () => {
    const s = buildDisplaySummary([], [], []);
    expect(s.showChip).toBe(false);
    expect(s.chipLabel).toBe("");
  });

  it("formats chip segments", () => {
    const s = buildDisplaySummary(
      [{ displayed: true } as never],
      [{ displayed: true } as never, { displayed: true } as never],
      []
    );
    expect(s.showChip).toBe(true);
    expect(s.chipLabel).toContain("1 assumption");
    expect(s.chipLabel).toContain("2 risks");
    expect(s.chipLabel).toContain("Verify");
  });
});

describe("applyJudgmentFilters", () => {
  it("returns empty when not eligible", () => {
    const result = applyJudgmentFilters({
      answerId: "ans-1",
      promptContent: "hi",
      answerContent: "Hello there!",
      metadata: { intentClass: "chitchat", stakesSignal: "low" },
      assumptionCandidates: [
        {
          id: "a1",
          statement: "Test",
          impactScore: 0.99,
          explicitInPromptOrAnswer: false,
          trivialOrUniversal: false,
          changesCorrectnessOrApplicability: true,
          userVerifiable: true,
        },
      ],
    });
    expect(result.summary.showChip).toBe(false);
    expect(result.assumptions).toHaveLength(0);
  });

  it("filters and summarizes eligible turn", () => {
    const longAnswer = "word ".repeat(60);
    const result = applyJudgmentFilters({
      answerId: "ans-2",
      promptContent: ctx.promptContent,
      answerContent: longAnswer,
      metadata: { intentClass: "decision", stakesSignal: "high" },
      assumptionCandidates: [
        {
          id: "a1",
          statement: "FX rates remain stable through launch",
          impactScore: 0.88,
          explicitInPromptOrAnswer: false,
          trivialOrUniversal: false,
          changesCorrectnessOrApplicability: true,
          userVerifiable: true,
        },
      ],
      riskCandidates: [
        {
          id: "r1",
          description: "Regulatory approval slips past Q2 2026",
          triggerCondition: "Approval after planned launch window",
          decisionImpact: "Postpone EU entry",
          impactScore: 0.82,
          genericDisclaimer: false,
          specificToAnswer: true,
          wouldChangeAction: true,
        },
      ],
      verificationCandidates: [
        {
          id: "v1",
          actionText: "Check the latest EU MDR filing status for your device class",
          effort: "moderate",
          linkedEntityType: "risk",
          linkedEntityId: "r1",
          parentDisplayed: true,
          vagueOrGeneric: false,
          estimatedMinutes: 15,
          duplicatesReadingAnswer: false,
          impactScore: 0.75,
        },
      ],
    });
    expect(result.assumptions).toHaveLength(1);
    expect(result.risks).toHaveLength(1);
    expect(result.verifications).toHaveLength(1);
    expect(result.summary.showChip).toBe(true);
  });
});
