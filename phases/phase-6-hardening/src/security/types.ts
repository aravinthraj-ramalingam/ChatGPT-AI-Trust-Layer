/** Security review types — Architecture §10 logging/PII cross-cutting */

export type PIICategory = "email" | "phone" | "ssn" | "credit_card" | "ip_address";

export interface PIIFinding {
  category: PIICategory;
  match: string;
  position: number;
}

export interface PIIScanResult {
  hasPII: boolean;
  findings: PIIFinding[];
  totalFindings: number;
}

export interface RedactedText {
  text: string;
  redactionCount: number;
  categories: PIICategory[];
}

export interface AuditFinding {
  field: string;
  entityType: string;
  entityId: string;
  piiScan: PIIScanResult;
}

export interface AuditReport {
  totalEntitiesScanned: number;
  entitiesWithPII: number;
  findings: AuditFinding[];
  passed: boolean;
  scannedAt: Date;
}
