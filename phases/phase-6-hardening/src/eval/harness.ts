import { runJudgmentPipeline } from "@ttj/phase-2-judgment-engines";
import type { EvalCase, EvalCaseResult, EvalReport, EvalItemClassification } from "./types.js";
import { classifyItem, computeEvalMetrics, mergeClassifications } from "./metrics.js";
import { EVAL_CASES } from "./fixtures/eval-cases.js";

/**
 * Run the full eval suite against the judgment pipeline.
 * Returns an EvalReport with per-case results and aggregate metrics.
 */
export async function runEvalSuite(
  cases: EvalCase[] = EVAL_CASES
): Promise<EvalReport> {
  const suiteStart = performance.now();
  const caseResults: EvalCaseResult[] = [];

  for (const evalCase of cases) {
    const caseStart = performance.now();

    const pipelineResult = await runJudgmentPipeline({
      answerId: `eval-ans-${evalCase.id}`,
      promptContent: evalCase.promptContent,
      answerContent: evalCase.answerContent,
      metadata: evalCase.metadata,
    });

    const surfacedAssumptions = pipelineResult.assumptions
      .filter((a) => a.displayed)
      .map((a) => a.statement);

    const surfacedRisks = pipelineResult.risks
      .filter((r) => r.displayed)
      .map((r) => r.description);

    // Classify assumptions
    const assumptionClassifications: EvalItemClassification[] = [];
    for (const expected of evalCase.expectedAssumptions) {
      assumptionClassifications.push(classifyItem(expected, true, surfacedAssumptions));
    }
    for (const unexpected of evalCase.unexpectedAssumptions) {
      assumptionClassifications.push(classifyItem(unexpected, false, surfacedAssumptions));
    }

    // Classify risks
    const riskClassifications: EvalItemClassification[] = [];
    for (const expected of evalCase.expectedRisks) {
      riskClassifications.push(classifyItem(expected, true, surfacedRisks));
    }
    for (const unexpected of evalCase.unexpectedRisks) {
      riskClassifications.push(classifyItem(unexpected, false, surfacedRisks));
    }

    caseResults.push({
      caseId: evalCase.id,
      assumptionClassifications,
      riskClassifications,
      surfacedAssumptions,
      surfacedRisks,
      elapsedMs: performance.now() - caseStart,
    });
  }

  // Aggregate metrics across all cases
  const allAssumptionClassifications = mergeClassifications(
    ...caseResults.map((r) => r.assumptionClassifications)
  );
  const allRiskClassifications = mergeClassifications(
    ...caseResults.map((r) => r.riskClassifications)
  );

  return {
    totalCases: cases.length,
    assumptionMetrics: computeEvalMetrics(allAssumptionClassifications),
    riskMetrics: computeEvalMetrics(allRiskClassifications),
    caseResults,
    totalElapsedMs: performance.now() - suiteStart,
  };
}
