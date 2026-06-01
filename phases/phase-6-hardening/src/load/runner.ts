import { runJudgmentPipeline } from "@ttj/phase-2-judgment-engines";
import type { LoadTestConfig, LoadTestResult, LoadTestRequestResult } from "./types.js";

/**
 * Run a load test against the judgment pipeline.
 * Fires N concurrent requests with configurable concurrency and timeout.
 */
export async function runLoadTest(config: LoadTestConfig): Promise<LoadTestResult> {
  const results: LoadTestRequestResult[] = [];
  const suiteStart = performance.now();

  // Process requests in batches of `concurrency`
  let requestIndex = 0;

  while (requestIndex < config.totalRequests) {
    const batchSize = Math.min(config.concurrency, config.totalRequests - requestIndex);
    const batch: Promise<LoadTestRequestResult>[] = [];

    for (let i = 0; i < batchSize; i++) {
      const idx = requestIndex + i;
      const fixture = config.fixtures[idx % config.fixtures.length]!;
      batch.push(
        runSingleRequest(idx, fixture, config.requestTimeoutMs)
      );
    }

    const batchResults = await Promise.all(batch);
    results.push(...batchResults);
    requestIndex += batchSize;
  }

  const totalElapsedMs = performance.now() - suiteStart;
  const completedRequests = results.filter((r) => r.success).length;
  const failedRequests = results.filter((r) => !r.success).length;
  const successfulLatencies = results
    .filter((r) => r.success)
    .map((r) => r.latencyMs)
    .sort((a, b) => a - b);

  return {
    config,
    completedRequests,
    failedRequests,
    totalElapsedMs,
    requestsPerSecond: totalElapsedMs > 0 ? (config.totalRequests / totalElapsedMs) * 1000 : 0,
    avgLatencyMs:
      successfulLatencies.length > 0
        ? successfulLatencies.reduce((a, b) => a + b, 0) / successfulLatencies.length
        : 0,
    p95LatencyMs: percentile(successfulLatencies, 95),
    p99LatencyMs: percentile(successfulLatencies, 99),
    maxLatencyMs: successfulLatencies.length > 0 ? successfulLatencies[successfulLatencies.length - 1]! : 0,
    minLatencyMs: successfulLatencies.length > 0 ? successfulLatencies[0]! : 0,
    errorRate: config.totalRequests > 0 ? failedRequests / config.totalRequests : 0,
    requestResults: results,
  };
}

async function runSingleRequest(
  index: number,
  fixture: { promptContent: string; answerContent: string; metadata?: { intentClass: string; stakesSignal: string } },
  timeoutMs: number
): Promise<LoadTestRequestResult> {
  const start = performance.now();

  try {
    await Promise.race([
      runJudgmentPipeline({
        answerId: `load-${index}`,
        promptContent: fixture.promptContent,
        answerContent: fixture.answerContent,
        metadata: fixture.metadata as { intentClass: "informational" | "planning" | "decision" | "creative" | "chitchat"; stakesSignal: "low" | "medium" | "high" | "very_high" },
      }),
      new Promise<never>((_, reject) =>
        setTimeout(() => reject(new Error("request_timeout")), timeoutMs)
      ),
    ]);

    return {
      index,
      success: true,
      latencyMs: performance.now() - start,
    };
  } catch (err) {
    return {
      index,
      success: false,
      latencyMs: performance.now() - start,
      error: err instanceof Error ? err.message : String(err),
    };
  }
}

function percentile(sortedValues: number[], p: number): number {
  if (sortedValues.length === 0) return 0;
  const idx = Math.ceil((p / 100) * sortedValues.length) - 1;
  return sortedValues[Math.max(0, idx)]!;
}
