import { describe, expect, it } from "vitest";
import { classifyPrompt } from "../src/classify-prompt.js";

describe("classifyPrompt", () => {
  it("classifies chitchat", () => {
    expect(classifyPrompt("Hello!").intentClass).toBe("chitchat");
  });

  it("classifies creative writing", () => {
    expect(classifyPrompt("Write a short poem about rain").intentClass).toBe(
      "creative"
    );
  });

  it("classifies decision intent with high stakes", () => {
    const meta = classifyPrompt(
      "Should we acquire Company X given our Q3 budget?"
    );
    expect(meta.intentClass).toBe("decision");
    expect(meta.stakesSignal).toBe("high");
  });

  it("classifies planning with medium stakes", () => {
    const meta = classifyPrompt("Create a project plan for the API launch");
    expect(meta.intentClass).toBe("planning");
    expect(meta.stakesSignal).toBe("medium");
  });

  it("classifies informational low stakes by default", () => {
    const meta = classifyPrompt("What is photosynthesis?");
    expect(meta.intentClass).toBe("informational");
    expect(meta.stakesSignal).toBe("low");
  });
});
