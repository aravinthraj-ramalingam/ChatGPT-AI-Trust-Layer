/** Core domain types — aligned with Architecture §12 */

export type IntentClass =
  | "informational"
  | "planning"
  | "decision"
  | "creative"
  | "chitchat";

export type StakesSignal = "low" | "medium" | "high" | "very_high";

export type JudgmentStatus =
  | "pending"
  | "complete"
  | "failed"
  | "skipped";

export type ImpactLevel = "medium" | "high";

export type VerificationEffort = "quick" | "moderate";

export type LinkedEntityType = "assumption" | "risk";

export type FeedbackTargetType =
  | "layer"
  | "assumption"
  | "risk"
  | "verification";

export type FeedbackSignal = "positive" | "negative";

export interface Prompt {
  id: string;
  conversationId: string;
  content: string;
  intentClass: IntentClass;
  stakesSignal: StakesSignal;
  createdAt: Date;
}

export interface Answer {
  id: string;
  promptId: string;
  content: string;
  judgmentEligible: boolean;
  judgmentStatus: JudgmentStatus;
  createdAt: Date;
}

/** Candidate before show/hide filtering */
export interface CandidateAssumption {
  id: string;
  statement: string;
  impactScore: number;
  impactLevel?: ImpactLevel;
  explicitInPromptOrAnswer: boolean;
  trivialOrUniversal: boolean;
  changesCorrectnessOrApplicability: boolean;
  userVerifiable: boolean;
  showReason?: string;
}

export interface Assumption extends CandidateAssumption {
  answerId: string;
  displayed: boolean;
  rank: number;
}

/** Candidate before show/hide filtering */
export interface CandidateRisk {
  id: string;
  description: string;
  triggerCondition: string;
  decisionImpact: string;
  impactScore: number;
  genericDisclaimer: boolean;
  specificToAnswer: boolean;
  wouldChangeAction: boolean;
  showReason?: string;
}

export interface DecisionRisk extends CandidateRisk {
  answerId: string;
  displayed: boolean;
  rank: number;
}

/** Candidate before show/hide filtering */
export interface CandidateVerification {
  id: string;
  actionText: string;
  effort: VerificationEffort;
  linkedEntityType: LinkedEntityType;
  linkedEntityId: string;
  parentDisplayed: boolean;
  vagueOrGeneric: boolean;
  estimatedMinutes: number;
  duplicatesReadingAnswer: boolean;
  impactScore: number;
}

export interface VerificationAction extends CandidateVerification {
  answerId: string;
  displayed: boolean;
  rank: number;
}

export interface Feedback {
  id: string;
  answerId: string;
  targetType: FeedbackTargetType;
  targetId: string | null;
  signal: FeedbackSignal;
  comment?: string;
  createdAt: Date;
}

export interface PromptMetadata {
  intentClass: IntentClass;
  stakesSignal: StakesSignal;
}

export interface JudgmentDisplaySummary {
  showChip: boolean;
  assumptionCount: number;
  riskCount: number;
  verificationCount: number;
  chipLabel: string;
}

export interface FilteredJudgmentItems {
  assumptions: Assumption[];
  risks: DecisionRisk[];
  verifications: VerificationAction[];
  summary: JudgmentDisplaySummary;
}
