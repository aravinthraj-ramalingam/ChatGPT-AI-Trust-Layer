# Phase 2 — Judgment Engines

**Status:** Not started

## Goal

Extract candidate assumptions, decision risks, and verification actions from answer + prompt metadata; pass outputs to Phase 1 filters.

## Checklist

See [PHASE-CHECKLIST.md](../../PHASE-CHECKLIST.md) — Phase 2 section.

## Planned structure

```
src/
  assumption-engine.ts
  risk-engine.ts
  verification-engine.ts
  providers/          # optional LLM adapter
tests/
```

## Depends on

- `@ttj/phase-1-foundation` — types and `applyJudgmentFilters`
