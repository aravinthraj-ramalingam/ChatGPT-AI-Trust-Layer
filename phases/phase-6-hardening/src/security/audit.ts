import type { JudgmentResult } from "@ttj/phase-3-pipeline";
import { scanForPII } from "./pii-scanner.js";
import type { AuditFinding, AuditReport } from "./types.js";

/**
 * Audit JudgmentResult entities for PII leakage.
 * Scans assumption statements, risk descriptions, and verification action text.
 */
export function auditJudgmentArtifacts(results: JudgmentResult[]): AuditReport {
  const findings: AuditFinding[] = [];
  let totalScanned = 0;
  let entitiesWithPII = 0;

  for (const result of results) {
    // Scan assumptions
    for (const assumption of result.assumptions) {
      totalScanned++;
      const scan = scanForPII(assumption.statement);
      if (scan.hasPII) {
        entitiesWithPII++;
        findings.push({
          field: "statement",
          entityType: "assumption",
          entityId: assumption.id,
          piiScan: scan,
        });
      }
    }

    // Scan risks
    for (const risk of result.risks) {
      totalScanned++;
      const descScan = scanForPII(risk.description);
      if (descScan.hasPII) {
        entitiesWithPII++;
        findings.push({
          field: "description",
          entityType: "risk",
          entityId: risk.id,
          piiScan: descScan,
        });
      }
      const triggerScan = scanForPII(risk.triggerCondition);
      if (triggerScan.hasPII) {
        findings.push({
          field: "triggerCondition",
          entityType: "risk",
          entityId: risk.id,
          piiScan: triggerScan,
        });
      }
      const impactScan = scanForPII(risk.decisionImpact);
      if (impactScan.hasPII) {
        findings.push({
          field: "decisionImpact",
          entityType: "risk",
          entityId: risk.id,
          piiScan: impactScan,
        });
      }
    }

    // Scan verifications
    for (const verification of result.verifications) {
      totalScanned++;
      const scan = scanForPII(verification.actionText);
      if (scan.hasPII) {
        entitiesWithPII++;
        findings.push({
          field: "actionText",
          entityType: "verification",
          entityId: verification.id,
          piiScan: scan,
        });
      }
    }
  }

  return {
    totalEntitiesScanned: totalScanned,
    entitiesWithPII,
    findings,
    passed: findings.length === 0,
    scannedAt: new Date(),
  };
}
