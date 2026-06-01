import type { JudgmentResult } from "./types.js";

export interface JudgmentStore {
  get(answerId: string): JudgmentResult | undefined;
  set(answerId: string, result: JudgmentResult): void;
  delete(answerId: string): boolean;
  has(answerId: string): boolean;
  clear(): void;
}

/** In-memory store for MVP — Architecture §10 */
export class InMemoryJudgmentStore implements JudgmentStore {
  private readonly byAnswerId = new Map<string, JudgmentResult>();

  get(answerId: string): JudgmentResult | undefined {
    return this.byAnswerId.get(answerId);
  }

  set(answerId: string, result: JudgmentResult): void {
    this.byAnswerId.set(answerId, result);
  }

  delete(answerId: string): boolean {
    return this.byAnswerId.delete(answerId);
  }

  has(answerId: string): boolean {
    return this.byAnswerId.has(answerId);
  }

  clear(): void {
    this.byAnswerId.clear();
  }
}
