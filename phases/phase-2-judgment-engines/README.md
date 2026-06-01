# Phase 2 — Judgment Engines

Extracts candidate **assumptions**, **decision risks**, and **verification actions**, then passes them through Phase 1 filters via `runJudgmentPipeline`.

## Modules

| Module | Responsibility |
|--------|----------------|
| `engines/assumption-engine.ts` | Assumption candidate extraction |
| `engines/risk-engine.ts` | Risk candidate extraction |
| `engines/verification-engine.ts` | Verification action generation |
| `extract/*` | Heuristic sentence parsers (MVP) |
| `providers/heuristic-provider.ts` | Default provider (no LLM) |
| `providers/types.ts` | `JudgmentProvider` interface for future LLM adapter |
| `merge/dedupe.ts` | Dedupe + assumption/risk overlap merge |
| `judgment-pipeline.ts` | End-to-end: engines → Phase 1 filters |

## Usage

```typescript
import { runJudgmentPipeline } from "@ttj/phase-2-judgment-engines";

const result = await runJudgmentPipeline({
  answerId: "ans-123",
  promptContent: userPrompt,
  answerContent: modelAnswer,
});

if (result.summary.showChip) {
  console.log(result.summary.chipLabel);
  console.log(result.assumptions, result.risks, result.verifications);
}
```

## Custom provider (optional LLM)

```typescript
import type { JudgmentProvider } from "@ttj/phase-2-judgment-engines";

const llmProvider: JudgmentProvider = {
  name: "llm",
  extractAssumptions: async (ctx) => { /* ... */ },
  extractRisks: async (ctx) => { /* ... */ },
};

await runJudgmentPipeline({ ...input, provider: llmProvider });
```

## Tests

```bash
npm run test -w @ttj/phase-2-judgment-engines
```

## Status

Phase 2 checklist items **2.1–2.7** complete. See [PHASE-CHECKLIST.md](../../PHASE-CHECKLIST.md).
