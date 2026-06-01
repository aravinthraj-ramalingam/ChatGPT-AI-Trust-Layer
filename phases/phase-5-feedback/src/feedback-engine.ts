import type { Feedback } from "@ttj/phase-1-foundation";
import { aggregateForEval } from "./aggregate.js";
import type { FeedbackStore } from "./feedback-store.js";
import { InMemoryFeedbackStore } from "./feedback-store.js";
import type { FeedbackAggregate, SubmitFeedbackInput } from "./types.js";
import {
  validateFeedbackInput,
  type ValidationOptions,
} from "./validation.js";

function createId(): string {
  return `fb_${crypto.randomUUID().slice(0, 8)}`;
}

export class FeedbackEngine {
  constructor(private readonly store: FeedbackStore = new InMemoryFeedbackStore()) {}

  getStore(): FeedbackStore {
    return this.store;
  }

  submit(
    input: SubmitFeedbackInput,
    validationOptions?: ValidationOptions
  ): Feedback {
    const validated = validateFeedbackInput(input, validationOptions);
    if (!validated.ok) {
      throw new FeedbackValidationError(validated.errors);
    }
    return this.ingest(validated.data);
  }

  ingest(input: SubmitFeedbackInput): Feedback {
    const feedback: Feedback = {
      id: createId(),
      answerId: input.answerId,
      targetType: input.targetType,
      targetId: input.targetId,
      signal: input.signal,
      comment: input.comment,
      createdAt: new Date(),
    };
    this.store.save(feedback);
    return feedback;
  }

  getAggregates(answerId?: string): FeedbackAggregate & { answerId?: string } {
    return aggregateForEval(this.store.getAll(), answerId);
  }
}

export class FeedbackValidationError extends Error {
  constructor(public readonly errors: string[]) {
    super(errors.join("; "));
    this.name = "FeedbackValidationError";
  }
}
