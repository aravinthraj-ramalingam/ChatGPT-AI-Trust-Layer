import type { Feedback } from "@ttj/phase-1-foundation";

export interface FeedbackStore {
  save(feedback: Feedback): void;
  getByAnswerId(answerId: string): Feedback[];
  getAll(): Feedback[];
  clear(): void;
}

/** In-memory feedback persistence (MVP) */
export class InMemoryFeedbackStore implements FeedbackStore {
  private readonly items: Feedback[] = [];

  save(feedback: Feedback): void {
    this.items.push(feedback);
  }

  getByAnswerId(answerId: string): Feedback[] {
    return this.items.filter((f) => f.answerId === answerId);
  }

  getAll(): Feedback[] {
    return [...this.items];
  }

  clear(): void {
    this.items.length = 0;
  }
}
