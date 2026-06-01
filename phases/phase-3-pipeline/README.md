# Phase 3 — Pipeline & Answer Layer

**Status:** Implemented

Answer-first turn orchestration with async judgment, in-memory store, and feature flags.

## Modules

| Module | Responsibility |
|--------|----------------|
| `turn-orchestrator.ts` | `executeTurn`, `regenerateTurn`, `waitForJudgment` |
| `answer-layer/stub-answer-layer.ts` | MVP answer adapter (swap for ChatGPT) |
| `judgment-store.ts` | `InMemoryJudgmentStore` |
| `judgment-result-mapper.ts` | `JudgmentResult` DTO for UI |
| `feature-flags.ts` | `trust_through_judgment_enabled` + kill switch |

## Usage

```typescript
import { TurnOrchestrator, StubAnswerLayer } from "@ttj/phase-3-pipeline";

const orchestrator = new TurnOrchestrator({
  answerLayer: new StubAnswerLayer((prompt) => generateFromLLM(prompt)),
});

// Answer-first (judgment async)
const turn = await orchestrator.executeTurn({
  conversationId: "conv-1",
  promptContent: userPrompt,
});

// Or wait for judgment (tests / explicit refresh)
const complete = await orchestrator.executeTurn({
  conversationId: "conv-1",
  promptContent: userPrompt,
  awaitJudgment: true,
});

console.log(complete.judgment?.summary.chipLabel);
```

## Environment

| Variable | Effect |
|----------|--------|
| `TRUST_THROUGH_JUDGMENT_ENABLED=false` | Disables judgment pipeline |
| `JUDGMENT_KILL_SWITCH=true` | Global kill switch |

## Tests

```bash
npm run test -w @ttj/phase-3-pipeline
```

See [PHASE-CHECKLIST.md](../../PHASE-CHECKLIST.md).
