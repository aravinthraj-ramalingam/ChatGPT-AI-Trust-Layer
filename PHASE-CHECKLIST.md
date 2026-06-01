# Trust Through Judgment — Phase Checklist

Master implementation tracker aligned with [docs/ARCHITECTURE.md](./docs/ARCHITECTURE.md).

**Legend:** `[x]` done · `[ ]` not started · `[-]` in progress

---

## Phase 1 — Foundation & Decision Logic

**Folder:** `phases/phase-1-foundation/`  
**Goal:** Domain model, prompt classification, eligibility gates, show/hide filters, display summary, tests.

| # | Task | Status |
|---|------|--------|
| 1.1 | Monorepo / workspace root (`package.json`, TypeScript) | [x] |
| 1.2 | Core domain types (Prompt, Answer, Assumption, Risk, Verification, Feedback) | [x] |
| 1.3 | Prompt classifier (`intent_class`, `stakes_signal`) | [x] |
| 1.4 | Global judgment eligibility gate | [x] |
| 1.5 | Assumption show/hide filter (impact ≥ 0.65, caps, blocklist) | [x] |
| 1.6 | Risk show/hide filter (impact ≥ 0.70, generic disclaimer block) | [x] |
| 1.7 | Verification show/hide filter (linked parent, vagueness block) | [x] |
| 1.8 | Display summary builder (judgment chip text) | [x] |
| 1.9 | Unit tests for all decision logic | [x] |
| 1.10 | Phase README + public API exports | [x] |

---

## Phase 2 — Judgment Engines

**Folder:** `phases/phase-2-judgment-engines/`  
**Goal:** Extract assumptions, risks, and verifications from answer + prompt metadata.

| # | Task | Status |
|---|------|--------|
| 2.1 | Assumption Engine interface + candidate extraction | [ ] |
| 2.2 | Decision Risk Engine interface + candidate extraction | [ ] |
| 2.3 | Verification Engine interface + action generation | [ ] |
| 2.4 | Wire Phase 1 filters to engine outputs | [ ] |
| 2.5 | Dedupe / merge duplicate assumptions & risks | [ ] |
| 2.6 | Engine unit tests + fixture answers | [ ] |
| 2.7 | Optional LLM adapter (pluggable provider) | [ ] |

---

## Phase 3 — Pipeline & Answer Layer

**Folder:** `phases/phase-3-pipeline/`  
**Goal:** Answer-first orchestration, async judgment, fail-open semantics.

| # | Task | Status |
|---|------|--------|
| 3.1 | Answer Layer stub / adapter interface | [ ] |
| 3.2 | Judgment pipeline orchestrator (post-answer async) | [ ] |
| 3.3 | In-memory Judgment Store | [ ] |
| 3.4 | `JudgmentResult` DTO for presentation | [ ] |
| 3.5 | Regenerate → new judgment artifact | [ ] |
| 3.6 | Integration tests (prompt → answer → judgment) | [ ] |
| 3.7 | Feature flag + kill switch hooks | [ ] |

---

## Phase 4 — Presentation Layer

**Folder:** `phases/phase-4-presentation/`  
**Goal:** UX screens 1–6, progressive disclosure, accessibility.

| # | Task | Status |
|---|------|--------|
| 4.1 | App shell + routing | [ ] |
| 4.2 | Screen 1 — Prompt composer | [ ] |
| 4.3 | Screen 2 — Answer + streaming | [ ] |
| 4.4 | Screen 3 — Assumptions panel | [ ] |
| 4.5 | Screen 4 — Decision risks panel | [ ] |
| 4.6 | Screen 5 — Verification checklist | [ ] |
| 4.7 | Judgment chip (L1) + collapse states | [ ] |
| 4.8 | WCAG 2.1 AA pass (keyboard, ARIA) | [ ] |
| 4.9 | Connect UI to Phase 3 API | [ ] |

---

## Phase 5 — Feedback & Integration

**Folder:** `phases/phase-5-feedback/`  
**Goal:** Feedback engine, persistence, API endpoints.

| # | Task | Status |
|---|------|--------|
| 5.1 | Feedback entity validation | [ ] |
| 5.2 | Feedback Engine (ingest + store) | [ ] |
| 5.3 | `POST /feedback` endpoint | [ ] |
| 5.4 | `POST /turns/{id}/judgment` endpoint | [ ] |
| 5.5 | Per-target thumbs (assumption, risk, verification, layer) | [ ] |
| 5.6 | Feedback aggregation for eval (no PII) | [ ] |

---

## Phase 6 — Hardening & Launch Readiness

**Folder:** `phases/phase-6-hardening/`  
**Goal:** NFRs, metrics, eval harness, rollout.

| # | Task | Status |
|---|------|--------|
| 6.1 | Eval set: false positive / false negative rate | [ ] |
| 6.2 | Performance budgets (judgment p95 ≤ 3s) | [ ] |
| 6.3 | VAR / guardrail metric instrumentation | [ ] |
| 6.4 | Load / scale test judgment workers | [ ] |
| 6.5 | Security review (logging, PII) | [ ] |
| 6.6 | Controlled rollout + kill switch drill | [ ] |
| 6.7 | Documentation runbook | [ ] |

---

## MVP Requirements Traceability

| Arch requirement | Phase |
|------------------|-------|
| M1 Answer first | 3, 4 |
| M2–M4 Detection | 2 |
| M5 Hide empty chip | 1, 4 |
| M6 Progressive disclosure | 4 |
| M7 Feedback | 5 |
| M8 No scores/citations | 1, 4 |
| M9 Fail-open | 3 |
| M10 Per-turn scope | 3 |

---

## Quick commands

```bash
# Install (from repo root)
npm install

# Phase 1 tests
npm run test:phase-1

# Build all phases
npm run build
```
