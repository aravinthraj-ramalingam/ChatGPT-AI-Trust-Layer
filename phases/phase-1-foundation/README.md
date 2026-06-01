# Phase 1 — Foundation & Decision Logic

Implements Architecture **§11 Decision Logic** and **§12 Data Model** (types + filters).

## What's included

| Module | Responsibility |
|--------|----------------|
| `types.ts` | Domain entities and DTOs |
| `classify-prompt.ts` | `intent_class` + `stakes_signal` (rule-based) |
| `eligibility.ts` | Global judgment eligibility gate |
| `filters/*` | Assumption, risk, verification show/hide |
| `display-summary.ts` | Judgment chip label builder |
| `judgment-filters.ts` | Orchestrates eligibility → filter → summary |

## Usage

```typescript
import {
  classifyPrompt,
  applyJudgmentFilters,
} from "@ttj/phase-1-foundation";

const metadata = classifyPrompt(userPrompt);

const result = applyJudgmentFilters({
  answerId: "ans-123",
  promptContent: userPrompt,
  answerContent: modelAnswer,
  metadata,
  assumptionCandidates: [], // Phase 2 engines populate
  riskCandidates: [],
  verificationCandidates: [],
});

if (result.summary.showChip) {
  console.log(result.summary.chipLabel);
}
```

## Tests

```bash
npm run test -w @ttj/phase-1-foundation
```

## Status

Phase 1 checklist items **1.1–1.10** complete. See [PHASE-CHECKLIST.md](../../PHASE-CHECKLIST.md).
