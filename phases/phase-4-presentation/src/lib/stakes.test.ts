import { describe, expect, it } from "vitest";
import {
  detectStakesForConfirmation,
  metadataWithUsage,
  stakesFromUsage,
  usageFromStakes,
} from "./stakes.js";

describe("stakes detection", () => {
  it("suggests executive for board-level prompts", () => {
    const result = detectStakesForConfirmation(
      "Board go/no-go: should we proceed with the acquisition?"
    );
    expect(result.metadata.stakesSignal).toBe("very_high");
    expect(result.suggestedUsage).toBe("executive_critical");
  });

  it("maps confirmed usage to metadata", () => {
    const base = detectStakesForConfirmation("What is GDP?").metadata;
    const meta = metadataWithUsage(base, "client_external");
    expect(meta.stakesSignal).toBe("high");
    expect(stakesFromUsage("brainstorming_learning")).toBe("low");
    expect(usageFromStakes("medium")).toBe("internal_draft");
  });
});
