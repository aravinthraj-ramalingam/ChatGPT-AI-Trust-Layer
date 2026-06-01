# Trust Through Judgment — Operational Runbook

## Overview

This runbook covers operational procedures for the Trust Through Judgment feature: monitoring, incident response, kill switch activation, and rollback procedures.

---

## Pre-Launch Checklist

- [ ] Eval suite passes with FP rate < 15% and FN rate < 10%
- [ ] Performance budgets met (p95 ≤ 3s, p99 ≤ 8s)
- [ ] Load test passes at 2x expected peak traffic
- [ ] PII audit passes on all judgment artifacts
- [ ] Kill switch drill passes all checks
- [ ] Controlled rollout simulation passes all steps
- [ ] Monitoring dashboards configured with VAR and guardrail metrics
- [ ] On-call team briefed on escalation procedures

---

## Feature Flags

| Flag | Env Variable | Default | Description |
|------|-------------|---------|-------------|
| `trust_through_judgment_enabled` | `TRUST_THROUGH_JUDGMENT_ENABLED` | `true` | Product feature flag |
| `judgment_kill_switch` | `JUDGMENT_KILL_SWITCH` | `false` | Global kill switch |

---

## Kill Switch Activation

### When to Activate

- Judgment pipeline causing > 5% error rate
- PII detected in judgment artifacts in production
- Significant user-facing latency regression (p95 > 5s sustained)
- Security incident related to judgment data

### How to Activate

1. Set environment variable: `JUDGMENT_KILL_SWITCH=true`
2. Verify suppression:
   ```
   GET /health/judgment
   Expected: { "active": false, "killSwitch": true }
   ```
3. Monitor for judgment-related errors dropping to zero within 60s
4. Notify on-call and product team

### Programmatic Verification

```typescript
import { executeKillSwitchDrill } from "@ttj/phase-6-hardening";

const drill = executeKillSwitchDrill();
console.log(`Drill passed: ${drill.passed}`);
console.log(`Checks: ${drill.checksPassed}/${drill.checks.length}`);
```

---

## Monitoring Dashboards

### North Star Metric: Verified Action Rate (VAR)

- **Definition:** % of judgment-eligible answers where user expands judgment AND marks ≥1 verification done OR submits positive verification feedback
- **Target:** Track baseline; expect moderate engagement (not max)
- **Alert:** VAR drops > 50% from baseline for > 1 hour

### Guardrail Metrics

| Metric | Alert Threshold | Action |
|--------|----------------|--------|
| Warning fatigue rate | > 15% negative feedback on layer | Review filter thresholds |
| Answer satisfaction regression | Statistically significant drop | Investigate UX impact |
| Regenerate rate spike | +10% after judgment shown | Review false positive rate |
| Hide rate | > 80% collapse without reading | Review relevance |

### Performance Metrics

| Metric | Budget | Alert Threshold |
|--------|--------|----------------|
| Judgment p95 latency | ≤ 3000ms | > 4000ms |
| Judgment p99 latency | ≤ 8000ms | > 10000ms |
| Pipeline failure rate | < 0.5% | > 1% |

---

## Escalation Procedures

### Level 1: Automated Alerts

- Performance budget exceeded → auto-scale judgment workers
- Error rate > 1% → page on-call engineer
- PII detected in logs → immediate page to security team

### Level 2: On-Call Engineer

1. Check kill switch status
2. Review error logs for pattern (specific prompt types, regions)
3. Run eval suite against recent failures
4. If unresolvable in 15 min → escalate to Level 3

### Level 3: Engineering Lead + Product

1. Activate kill switch if not already done
2. Assess user impact
3. Decide: hotfix vs. rollback vs. extended kill switch
4. Communicate status to stakeholders

---

## Rollback Procedure

### Emergency Rollback (Kill Switch)

1. `JUDGMENT_KILL_SWITCH=true` — immediate, no deployment required
2. All judgment UI hidden; answers delivered without judgment layer
3. No data loss; feedback pipeline continues accepting events

### Controlled Rollback (Feature Flag)

1. `TRUST_THROUGH_JUDGMENT_ENABLED=false` — disables at feature level
2. Use when rolling back for specific percentage of traffic
3. Monitor error rates at each reduction step

### Programmatic Controlled Rollout

```typescript
import { simulateControlledRollout } from "@ttj/phase-6-hardening";

const result = await simulateControlledRollout({
  steps: [100, 75, 50, 25, 10, 0],  // Decreasing traffic
  turnsPerStep: 20,
  errorRateThreshold: 0.05,
});
console.log(`Rollback passed: ${result.allStepsPassed}`);
```

---

## Incident Response

### PII Leak in Judgment Artifacts

1. Activate kill switch immediately
2. Run PII audit:
   ```typescript
   import { auditJudgmentArtifacts } from "@ttj/phase-6-hardening";
   const report = auditJudgmentArtifacts(recentResults);
   ```
3. Purge affected judgment records from store
4. Review extraction engines for PII pass-through
5. Fix and re-validate before re-enabling

### Judgment Pipeline Timeout Storm

1. Check worker health and scaling
2. Review p95/p99 latency dashboards
3. If sustained > 5s p95 → activate kill switch
4. Scale workers; investigate root cause
5. Run performance budget check before re-enabling

### False Positive Spike

1. Run eval suite against recent prompts
2. Compare FP rate to baseline
3. If FP rate > 20% → lower traffic percentage
4. Review filter thresholds in phase-1-foundation
5. Adjust thresholds and re-run eval before full re-enable

---

## Run Eval Suite

```typescript
import { runEvalSuite } from "@ttj/phase-6-hardening";

const report = await runEvalSuite();
console.log(`Assumption FP rate: ${report.assumptionMetrics.falsePositiveRate}`);
console.log(`Risk FP rate: ${report.riskMetrics.falsePositiveRate}`);
console.log(`Assumption FN rate: ${report.assumptionMetrics.falseNegativeRate}`);
```

---

## Security Procedures

### Log Sanitization

All judgment-related logs must pass through PII redaction:

```typescript
import { redactPII } from "@ttj/phase-6-hardening";

const sanitized = redactPII(logMessage);
// sanitized.text contains [REDACTED:email] etc.
```

### Data Retention

- Judgment artifacts: 30 days (configurable)
- Feedback: persisted with at-least-once delivery
- Eval results: retained indefinitely (no PII)
- Performance samples: 90 days

---

## Contact

- **On-call:** Check PagerDuty rotation
- **Engineering lead:** See team directory
- **Product:** Trust Through Judgment product team channel

---

*Last updated: Phase 6 implementation*
