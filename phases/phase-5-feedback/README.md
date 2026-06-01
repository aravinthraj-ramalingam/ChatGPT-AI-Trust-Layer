# Phase 5 — Feedback & Integration

Feedback engine, REST API, and eval aggregates.

## Modules

| Module | Responsibility |
|--------|----------------|
| `validation.ts` | Feedback payload validation |
| `feedback-engine.ts` | Ingest + store layer feedback |
| `aggregate.ts` | Eval aggregates (no PII) |
| `judgment-api.ts` | `POST /turns/:id/judgment` logic |
| `api/server.ts` | HTTP server |

## API

```bash
npm run build -w @ttj/phase-5-feedback
npm run start:api -w @ttj/phase-5-feedback
# http://localhost:8787
```

| Method | Path | Description |
|--------|------|-------------|
| POST | `/feedback` | Submit layer feedback |
| GET | `/feedback/aggregate?answerId=` | Aggregates |
| GET | `/turns/:answerId/judgment` | Stored judgment |
| POST | `/turns/:answerId/judgment` | Run judgment pipeline |

### POST /feedback

```json
{
  "answerId": "ans_abc123",
  "targetType": "layer",
  "targetId": null,
  "signal": "positive",
  "comment": "Optional text"
}
```

## Tests

```bash
npm run test -w @ttj/phase-5-feedback
```
