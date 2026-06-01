/** Load test types — Architecture §14 scalability */

import type { PromptMetadata } from "@ttj/phase-1-foundation";

export interface LoadTestConfig {
  /** Number of concurrent requests */
  concurrency: number;
  /** Total number of requests to fire */
  totalRequests: number;
  /** Timeout per individual request (ms) */
  requestTimeoutMs: number;
  /** Fixture prompt/answer pairs to cycle through */
  fixtures: LoadTestFixture[];
}

export interface LoadTestFixture {
  promptContent: string;
  answerContent: string;
  metadata?: PromptMetadata;
}

export interface LoadTestRequestResult {
  index: number;
  success: boolean;
  latencyMs: number;
  error?: string;
}

export interface LoadTestResult {
  config: LoadTestConfig;
  completedRequests: number;
  failedRequests: number;
  totalElapsedMs: number;
  requestsPerSecond: number;
  avgLatencyMs: number;
  p95LatencyMs: number;
  p99LatencyMs: number;
  maxLatencyMs: number;
  minLatencyMs: number;
  errorRate: number;
  requestResults: LoadTestRequestResult[];
}
