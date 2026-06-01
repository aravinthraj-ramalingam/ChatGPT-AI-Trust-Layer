# Phase 4 — Presentation Layer

React UI for Trust Through Judgment, connected to `@ttj/phase-3-pipeline`.

## Screens

| Screen | Component |
|--------|-----------|
| 1 — Prompt | `PromptComposer` |
| 2 — Answer | `AnswerView` + streaming |
| 3 — Assumptions | `AssumptionCard` in `JudgmentPanel` |
| 4 — Risks | `RiskCard` in `JudgmentPanel` |
| 5 — Verification | `VerificationChecklist` |
| 6 — Feedback | `LayerFeedback` (footer only; Phase 5 API) |
| L1 chip | `JudgmentChip` |

## Run

```bash
# From repo root
npm install
npm run dev -w @ttj/phase-4-presentation
```

Open http://localhost:5173 — use **Chat** and try the EU market demo prompt.

## Test

```bash
npm run test -w @ttj/phase-4-presentation
```

## Stack

- Vite + React 19 + React Router 7
- Workspace aliases to Phase 1–3 TypeScript sources

See [PHASE-CHECKLIST.md](../../PHASE-CHECKLIST.md).
