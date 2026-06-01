import type { EvalCase } from "../types.js";

/**
 * Hand-curated eval fixture set for measuring false positive/negative rates.
 * Each case includes expected items (should surface) and unexpected items (should not).
 */
export const EVAL_CASES: EvalCase[] = [
  {
    id: "eval-001-high-stakes-decision",
    promptContent:
      "Should our company expand into the European market next quarter given current regulatory changes?",
    answerContent:
      "Expanding into the European market next quarter could be advantageous. The EU has recently streamlined cross-border trade regulations, reducing compliance costs by approximately 15%. Key markets like Germany and France show strong demand for tech products. I recommend establishing a subsidiary in Ireland for tax optimization, which could save 10-12% on corporate taxes. The timing aligns well with the upcoming digital services act implementation.",
    metadata: { intentClass: "decision", stakesSignal: "high" },
    expectedAssumptions: [
      "EU regulatory changes reduce compliance costs",
      "Ireland subsidiary provides tax optimization",
    ],
    expectedRisks: [
      "Regulatory changes could reverse before expansion completes",
    ],
    unexpectedAssumptions: [
      "Companies want to make profit",
      "European markets exist",
    ],
    unexpectedRisks: [
      "AI may make mistakes",
      "Results may vary",
    ],
  },
  {
    id: "eval-002-informational-low-stakes",
    promptContent: "What is the capital of France?",
    answerContent:
      "The capital of France is Paris. It is located in the north-central part of the country and is the largest city in France.",
    metadata: { intentClass: "informational", stakesSignal: "low" },
    expectedAssumptions: [],
    expectedRisks: [],
    unexpectedAssumptions: [
      "Paris is a city",
      "France is a country",
    ],
    unexpectedRisks: [
      "Information could be outdated",
      "AI knowledge may be incomplete",
    ],
  },
  {
    id: "eval-003-planning-medium-stakes",
    promptContent:
      "Help me plan a 3-month product launch timeline for a new SaaS feature targeting enterprise customers.",
    answerContent:
      "Here's a 3-month launch plan: Month 1 — Complete development sprints and internal testing. Focus on security audits and load testing for enterprise scale. Month 2 — Beta program with 5-10 enterprise customers. Gather feedback on integration with existing workflows. Month 3 — GA release with enterprise support SLA (99.9% uptime). Launch enterprise onboarding documentation and dedicated success manager program. Pricing should follow value-based model at $50K ARR minimum.",
    metadata: { intentClass: "planning", stakesSignal: "medium" },
    expectedAssumptions: [
      "Development is nearly complete",
      "Enterprise customers will participate in beta",
    ],
    expectedRisks: [
      "Security audit could reveal blocking issues",
    ],
    unexpectedAssumptions: [
      "Software needs to work",
      "Customers use software",
    ],
    unexpectedRisks: [
      "The plan might not work",
      "Things could go wrong",
    ],
  },
  {
    id: "eval-004-creative",
    promptContent: "Write a haiku about mountains.",
    answerContent:
      "Tall peaks touch the sky,\nSnow crowns gleam in morning light,\nSilence fills the air.",
    metadata: { intentClass: "creative", stakesSignal: "low" },
    expectedAssumptions: [],
    expectedRisks: [],
    unexpectedAssumptions: [
      "Mountains have peaks",
      "Snow appears on mountains",
    ],
    unexpectedRisks: [
      "Poem may not match user preference",
    ],
  },
  {
    id: "eval-005-high-stakes-financial",
    promptContent:
      "What mortgage structure should I use for a $2M commercial property purchase with 30% down?",
    answerContent:
      "For a $2M commercial property with 30% down ($600K), you'll finance $1.4M. I recommend a 10-year fixed rate commercial mortgage with a 25-year amortization schedule. Current rates for well-qualified borrowers range from 5.5% to 6.5%. This gives you payment predictability while maintaining a balloon structure that keeps monthly payments manageable at approximately $8,200/month. Consider a rate buy-down if you plan to hold beyond 7 years. Prepayment penalties typically apply in the first 3-5 years.",
    metadata: { intentClass: "decision", stakesSignal: "very_high" },
    expectedAssumptions: [
      "Borrower qualifies for best commercial rates",
      "Property will generate sufficient cash flow",
    ],
    expectedRisks: [
      "Interest rates could rise significantly before refinancing",
      "Commercial property values could decline",
    ],
    unexpectedAssumptions: [
      "Real estate has value",
      "Banks lend money",
    ],
    unexpectedRisks: [
      "Financial advice may not be suitable",
      "Markets are unpredictable",
    ],
  },
];
