# Phase 6 — Hardening & Launch Readiness

**Status:** Complete

## Goal

NFR validation, eval harness, metrics, rollout runbook.

## Modules

| Module | Path | Description |
|--------|------|-------------|
| Eval | `src/eval/` | Eval harness, fixtures, FP/FN metrics |
| Performance | `src/performance/` | Latency budgets (p95 ≤ 3s, p99 ≤ 8s) |
| Metrics | `src/metrics/` | VAR + guardrail metric instrumentation |
| Load | `src/load/` | Concurrent load test runner |
| Security | `src/security/` | PII scanner + judgment artifact audit |
| Rollout | `src/rollout/` | Kill switch drill + controlled rollout |
| Runbook | `docs/RUNBOOK.md` | Operational runbook |

## Structure

```
src/
  eval/
    fixtures/eval-cases.ts
    harness.ts
    metrics.ts
    types.ts
  performance/
    budgets.ts
    measure.ts
    types.ts
  metrics/
    instrument.ts
    types.ts
  load/
    runner.ts
    types.ts
  security/
    pii-scanner.ts
    audit.ts
    types.ts
  rollout/
    kill-switch.ts
    rollout.ts
    types.ts
  index.ts
tests/
  phase-6.test.ts
docs/
  RUNBOOK.md
```

## Quick start

```bash
npm run test:phase-6
```

## Depends on

- Phases 1–5 complete
