# Phase 3 — Pipeline & Answer Layer

**Status:** Not started

## Goal

Answer-first orchestration: stream answer, run judgment async, fail-open on errors.

## Checklist

See [PHASE-CHECKLIST.md](../../PHASE-CHECKLIST.md) — Phase 3 section.

## Planned structure

```
src/
  answer-layer.ts
  judgment-pipeline.ts
  judgment-store.ts
  feature-flags.ts
tests/
```

## Depends on

- Phase 1 — decision logic
- Phase 2 — engines
