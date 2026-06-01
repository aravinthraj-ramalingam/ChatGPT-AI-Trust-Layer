import { describe, it, expect } from "vitest";
import {
  // Eval
  runEvalSuite,
  computeEvalMetrics,
  classifyItem,
  EVAL_CASES,
  // Performance
  checkBudget,
  DEFAULT_BUDGETS,
  measureJudgmentLatency,
  // Metrics
  computeVarMetrics,
  computeGuardrailMetrics,
  generateMetricEvents,
  // Load
  runLoadTest,
  // Security
  scanForPII,
  redactPII,
  auditJudgmentArtifacts,
  // Rollout
  executeKillSwitchDrill,
  simulateControlledRollout,
} from "../src/index.js";
import type { MetricsInput } from "../src/metrics/types.js";

// ─── 6.1 Eval Harness ────────────────────────────────────────────────

describe("6.1 Eval Harness", () => {
  it("classifyItem returns true_positive when expected item surfaces", () => {
    const result = classifyItem(
      "EU regulatory changes reduce compliance costs",
      true,
      ["EU regulatory changes reduce compliance costs by 15%"]
    );
    expect(result.classification).toBe("true_positive");
    expect(result.matched).toBeDefined();
  });

  it("classifyItem returns false_negative when expected item does not surface", () => {
    const result = classifyItem(
      "Some critical assumption",
      true,
      ["Completely different text"]
    );
    expect(result.classification).toBe("false_negative");
  });

  it("classifyItem returns true_negative when unexpected item does not surface", () => {
    const result = classifyItem(
      "AI may make mistakes",
      false,
      ["The market analysis shows growth potential"]
    );
    expect(result.classification).toBe("true_negative");
  });

  it("classifyItem returns false_positive when unexpected item surfaces", () => {
    const result = classifyItem(
      "AI may make mistakes",
      false,
      ["AI may make mistakes in this analysis"]
    );
    expect(result.classification).toBe("false_positive");
  });

  it("computeEvalMetrics calculates correct rates", () => {
    const metrics = computeEvalMetrics([
      { expected: "a", classification: "true_positive" },
      { expected: "b", classification: "true_positive" },
      { expected: "c", classification: "false_positive" },
      { expected: "d", classification: "true_negative" },
      { expected: "e", classification: "false_negative" },
    ]);

    expect(metrics.truePositives).toBe(2);
    expect(metrics.falsePositives).toBe(1);
    expect(metrics.trueNegatives).toBe(1);
    expect(metrics.falseNegatives).toBe(1);
    expect(metrics.precision).toBeCloseTo(2 / 3);
    expect(metrics.recall).toBeCloseTo(2 / 3);
    expect(metrics.falsePositiveRate).toBeCloseTo(0.5);
    expect(metrics.falseNegativeRate).toBeCloseTo(1 / 3);
  });

  it("EVAL_CASES fixture has at least 5 cases", () => {
    expect(EVAL_CASES.length).toBeGreaterThanOrEqual(5);
  });

  it("runEvalSuite produces a valid report", async () => {
    const report = await runEvalSuite(EVAL_CASES.slice(0, 2));
    expect(report.totalCases).toBe(2);
    expect(report.caseResults).toHaveLength(2);
    expect(report.assumptionMetrics).toBeDefined();
    expect(report.riskMetrics).toBeDefined();
    expect(report.totalElapsedMs).toBeGreaterThan(0);
    // Metrics should be valid numbers
    expect(report.assumptionMetrics.precision).toBeGreaterThanOrEqual(0);
    expect(report.assumptionMetrics.precision).toBeLessThanOrEqual(1);
  }, 30000);
});

// ─── 6.2 Performance Budgets ─────────────────────────────────────────

describe("6.2 Performance Budgets", () => {
  it("DEFAULT_BUDGETS has p95 and p99 budgets", () => {
    expect(DEFAULT_BUDGETS).toHaveLength(2);
    expect(DEFAULT_BUDGETS[0]!.name).toBe("judgment_p95");
    expect(DEFAULT_BUDGETS[0]!.maxMs).toBe(3000);
    expect(DEFAULT_BUDGETS[1]!.name).toBe("judgment_p99");
    expect(DEFAULT_BUDGETS[1]!.maxMs).toBe(8000);
  });

  it("checkBudget passes when under budget", () => {
    const result = checkBudget({ name: "test", maxMs: 3000, percentile: 95 }, 2500);
    expect(result.passed).toBe(true);
    expect(result.marginMs).toBe(500);
  });

  it("checkBudget fails when over budget", () => {
    const result = checkBudget({ name: "test", maxMs: 3000, percentile: 95 }, 3500);
    expect(result.passed).toBe(false);
    expect(result.marginMs).toBe(-500);
  });

  it("measureJudgmentLatency produces valid report", async () => {
    const report = await measureJudgmentLatency({
      fixtures: [
        {
          promptContent: "What is the capital of France?",
          answerContent: "The capital of France is Paris. It is a major European city.",
          metadata: { intentClass: "informational", stakesSignal: "low" },
        },
      ],
      iterations: 3,
      budgets: [{ name: "test_p95", maxMs: 10000, percentile: 95 }],
    });

    expect(report.samples).toHaveLength(3);
    expect(report.successfulSamples.length).toBeGreaterThanOrEqual(1);
    expect(report.percentiles.p95).toBeGreaterThanOrEqual(0);
    expect(report.budgetChecks).toHaveLength(1);
  }, 30000);
});

// ─── 6.3 VAR / Guardrail Metrics ─────────────────────────────────────

describe("6.3 Metric Instrumentation", () => {
  const sampleInput: MetricsInput = {
    totalEligibleAnswers: 100,
    answersWithJudgmentExpanded: 40,
    verificationsMarkedDone: 15,
    positiveVerificationFeedback: 5,
    feedbackByTargetType: {
      layer: { positive: 30, negative: 5 },
      assumption: { positive: 20, negative: 3 },
      risk: { positive: 10, negative: 2 },
      verification: { positive: 15, negative: 1 },
    },
    totalRegenerates: 20,
    regeneratesAfterJudgment: 5,
    totalExpands: 40,
    collapsesWithoutReading: 8,
  };

  it("computeVarMetrics calculates correct VAR", () => {
    const varMetrics = computeVarMetrics(sampleInput);
    expect(varMetrics.totalEligibleAnswers).toBe(100);
    expect(varMetrics.answersWithExpand).toBe(40);
    expect(varMetrics.verifiedActionCount).toBe(20); // 15 + 5
    expect(varMetrics.verifiedActionRate).toBeCloseTo(0.2);
  });

  it("computeVarMetrics handles zero eligible", () => {
    const varMetrics = computeVarMetrics({ ...sampleInput, totalEligibleAnswers: 0 });
    expect(varMetrics.verifiedActionRate).toBe(0);
  });

  it("computeGuardrailMetrics calculates correct rates", () => {
    const guardrail = computeGuardrailMetrics(sampleInput);
    expect(guardrail.totalFeedbackItems).toBe(86); // 30+5+20+3+10+2+15+1
    expect(guardrail.warningFatigueRate).toBeCloseTo(5 / 40); // negative layer / expands
    expect(guardrail.answerSatisfactionRate).toBeCloseTo(30 / 35); // positive layer / total layer
    expect(guardrail.regenerateAfterJudgmentRate).toBeCloseTo(5 / 20);
    expect(guardrail.hideWithoutReadingRate).toBeCloseTo(8 / 40);
  });

  it("generateMetricEvents produces 7 events", () => {
    const events = generateMetricEvents(sampleInput);
    expect(events).toHaveLength(7);
    expect(events.filter((e) => e.type === "var")).toHaveLength(3);
    expect(events.filter((e) => e.type === "guardrail")).toHaveLength(4);
  });
});

// ─── 6.4 Load Test ───────────────────────────────────────────────────

describe("6.4 Load Test", () => {
  it("runLoadTest completes all requests", async () => {
    const result = await runLoadTest({
      concurrency: 3,
      totalRequests: 6,
      requestTimeoutMs: 10000,
      fixtures: [
        {
          promptContent: "What is the capital of France?",
          answerContent: "The capital of France is Paris, the largest city in France.",
          metadata: { intentClass: "informational", stakesSignal: "low" },
        },
      ],
    });

    expect(result.completedRequests + result.failedRequests).toBe(6);
    expect(result.requestResults).toHaveLength(6);
    expect(result.requestsPerSecond).toBeGreaterThan(0);
    expect(result.totalElapsedMs).toBeGreaterThan(0);
  }, 30000);
});

// ─── 6.5 Security Review ─────────────────────────────────────────────

describe("6.5 Security Review", () => {
  it("scanForPII detects emails", () => {
    const result = scanForPII("Contact john.doe@example.com for details.");
    expect(result.hasPII).toBe(true);
    expect(result.findings.some((f) => f.category === "email")).toBe(true);
  });

  it("scanForPII detects phone numbers", () => {
    const result = scanForPII("Call us at 555-123-4567 or (800) 555-0199.");
    expect(result.hasPII).toBe(true);
    expect(result.findings.some((f) => f.category === "phone")).toBe(true);
  });

  it("scanForPII detects SSNs", () => {
    const result = scanForPII("SSN: 123-45-6789");
    expect(result.hasPII).toBe(true);
    expect(result.findings.some((f) => f.category === "ssn")).toBe(true);
  });

  it("scanForPII returns clean for safe text", () => {
    const result = scanForPII("The market analysis shows growth in the tech sector.");
    expect(result.hasPII).toBe(false);
    expect(result.totalFindings).toBe(0);
  });

  it("redactPII replaces PII with redaction markers", () => {
    const result = redactPII("Email john@example.com or call 555-123-4567.");
    expect(result.text).toContain("[REDACTED:email]");
    expect(result.redactionCount).toBeGreaterThanOrEqual(1);
    expect(result.categories).toContain("email");
  });

  it("auditJudgmentArtifacts passes for clean data", () => {
    const report = auditJudgmentArtifacts([
      {
        answerId: "ans-1",
        promptId: "prm-1",
        metadata: { intentClass: "planning", stakesSignal: "medium" },
        assumptions: [
          {
            id: "a1",
            answerId: "ans-1",
            statement: "Market conditions remain stable",
            impactScore: 0.7,
            impactLevel: "medium",
            explicitInPromptOrAnswer: false,
            trivialOrUniversal: false,
            changesCorrectnessOrApplicability: true,
            userVerifiable: true,
            displayed: true,
            rank: 1,
          },
        ],
        risks: [],
        verifications: [],
        summary: { showChip: true, assumptionCount: 1, riskCount: 0, verificationCount: 0, chipLabel: "1 assumption" },
        status: "complete",
        completedAt: new Date(),
      },
    ]);

    expect(report.passed).toBe(true);
    expect(report.totalEntitiesScanned).toBe(1);
    expect(report.entitiesWithPII).toBe(0);
  });

  it("auditJudgmentArtifacts detects PII in assumptions", () => {
    const report = auditJudgmentArtifacts([
      {
        answerId: "ans-2",
        promptId: "prm-2",
        metadata: { intentClass: "decision", stakesSignal: "high" },
        assumptions: [
          {
            id: "a2",
            answerId: "ans-2",
            statement: "User john@company.com should verify the data",
            impactScore: 0.8,
            impactLevel: "high",
            explicitInPromptOrAnswer: false,
            trivialOrUniversal: false,
            changesCorrectnessOrApplicability: true,
            userVerifiable: true,
            displayed: true,
            rank: 1,
          },
        ],
        risks: [],
        verifications: [],
        summary: { showChip: true, assumptionCount: 1, riskCount: 0, verificationCount: 0, chipLabel: "1 assumption" },
        status: "complete",
        completedAt: new Date(),
      },
    ]);

    expect(report.passed).toBe(false);
    expect(report.entitiesWithPII).toBeGreaterThanOrEqual(1);
    expect(report.findings.some((f) => f.piiScan.findings.some((p) => p.category === "email"))).toBe(true);
  });
});

// ─── 6.6 Kill Switch Drill ───────────────────────────────────────────

describe("6.6 Kill Switch Drill", () => {
  it("executeKillSwitchDrill passes all checks", () => {
    const drill = executeKillSwitchDrill();
    expect(drill.passed).toBe(true);
    expect(drill.checksFailed).toBe(0);
    expect(drill.checksPassed).toBe(drill.checks.length);
    expect(drill.judgmentSuppressed).toBe(true);
    expect(drill.pipelineSkipped).toBe(true);
    expect(drill.uiHidden).toBe(true);
  });

  it("drill includes expected check names", () => {
    const drill = executeKillSwitchDrill();
    const checkNames = drill.checks.map((c) => c.name);
    expect(checkNames).toContain("pipeline_suppressed");
    expect(checkNames).toContain("ui_hidden");
    expect(checkNames).toContain("kill_switch_overrides_feature");
    expect(checkNames).toContain("normal_operation");
  });
});

// ─── 6.6 Controlled Rollout ─────────────────────────────────────────

describe("6.6 Controlled Rollout", () => {
  it("simulateControlledRollout completes all steps", async () => {
    const result = await simulateControlledRollout({
      steps: [10, 50, 100],
      turnsPerStep: 5,
    });

    expect(result.steps).toHaveLength(3);
    expect(result.totalTurns).toBe(15);
    expect(result.totalErrors).toBe(0);
    expect(result.allStepsPassed).toBe(true);
  });

  it("simulateControlledRollout detects high error rates", async () => {
    let callCount = 0;
    const result = await simulateControlledRollout({
      steps: [100],
      turnsPerStep: 10,
      errorRateThreshold: 0.05,
      simulateTurn: async () => {
        callCount++;
        // Fail 50% of turns
        return callCount % 2 === 0;
      },
    });

    expect(result.allStepsPassed).toBe(false);
    expect(result.steps[0]!.passed).toBe(false);
    expect(result.steps[0]!.errorRate).toBeCloseTo(0.5);
  });

  it("rollout steps include traffic percentages", async () => {
    const result = await simulateControlledRollout({
      steps: [25, 75],
      turnsPerStep: 3,
    });

    expect(result.steps[0]!.step.trafficPercent).toBe(25);
    expect(result.steps[1]!.step.trafficPercent).toBe(75);
  });
});
