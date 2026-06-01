import {
  classifyPrompt,
  describeDetectedStakes,
  type PromptMetadata,
  type StakesSignal,
} from "@ttj/phase-1-foundation";

/** How the user plans to use the model output */
export type UsageCategory =
  | "brainstorming_learning"
  | "internal_draft"
  | "client_external"
  | "executive_critical";

export interface UsageOption {
  id: UsageCategory;
  label: string;
  shortLabel: string;
  description: string;
  stakes: StakesSignal;
}

export const USAGE_OPTIONS: UsageOption[] = [
  {
    id: "brainstorming_learning",
    label: "Brainstorming / learning",
    shortLabel: "Low stakes",
    description: "Exploring ideas — low stakes",
    stakes: "low",
  },
  {
    id: "internal_draft",
    label: "Internal draft",
    shortLabel: "Medium",
    description: "Team review only — medium stakes",
    stakes: "medium",
  },
  {
    id: "client_external",
    label: "Client / external issue",
    shortLabel: "High",
    description: "Shared outside the team — high stakes",
    stakes: "high",
  },
  {
    id: "executive_critical",
    label: "Executive decision / critical",
    shortLabel: "Very high",
    description: "Board, exec, or material impact — very high stakes",
    stakes: "very_high",
  },
];

export function getUsageOption(category: UsageCategory): UsageOption {
  return USAGE_OPTIONS.find((o) => o.id === category)!;
}

export function stakesFromUsage(category: UsageCategory): StakesSignal {
  return getUsageOption(category).stakes;
}

export function usageFromStakes(stakes: StakesSignal): UsageCategory {
  switch (stakes) {
    case "very_high":
      return "executive_critical";
    case "high":
      return "client_external";
    case "medium":
      return "internal_draft";
    case "low":
    default:
      return "brainstorming_learning";
  }
}

export interface StakesDetection {
  metadata: PromptMetadata;
  suggestedUsage: UsageCategory;
  detectionHint: string;
}

export function detectStakesForConfirmation(promptContent: string): StakesDetection {
  const metadata = classifyPrompt(promptContent);
  const suggestedUsage = usageFromStakes(metadata.stakesSignal);
  const detectionHint = describeDetectedStakes(
    metadata.stakesSignal,
    metadata.intentClass
  );

  return { metadata, suggestedUsage, detectionHint };
}

export function metadataWithUsage(
  base: PromptMetadata,
  usage: UsageCategory
): PromptMetadata {
  return {
    ...base,
    stakesSignal: stakesFromUsage(usage),
  };
}
