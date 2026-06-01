# Trust Through Judgment

Implementation workspace for the **Trust Through Judgment** ChatGPT feature.

- **Architecture:** [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md)
- **Phase checklist:** [PHASE-CHECKLIST.md](./PHASE-CHECKLIST.md)

## Phases

| Phase | Folder | Status |
|-------|--------|--------|
| 1 — Foundation & decision logic | `phases/phase-1-foundation/` | Implemented |
| 2 — Judgment engines | `phases/phase-2-judgment-engines/` | Implemented |
| 3 — Pipeline & answer layer | `phases/phase-3-pipeline/` | Implemented |
| 4 — Presentation layer | `phases/phase-4-presentation/` | Implemented |
| 5 — Feedback & integration | `phases/phase-5-feedback/` | Implemented |
| 6 — Hardening & launch | `phases/phase-6-hardening/` | Planned |

## Setup

```bash
npm install
npm run test:phase-1
npm run test:phase-2
npm run test:phase-3
npm run test:phase-4
npm run dev:ui
```
