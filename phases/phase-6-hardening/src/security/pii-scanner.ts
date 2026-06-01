import type { PIICategory, PIIFinding, PIIScanResult, RedactedText } from "./types.js";

/**
 * PII detection patterns for common sensitive data types.
 * Architecture §10: no prompt PII in judgment metrics.
 */
const PII_PATTERNS: Array<{ category: PIICategory; pattern: RegExp }> = [
  { category: "email", pattern: /[a-zA-Z0-9._%+-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,}/g },
  { category: "phone", pattern: /(?:\+?1[-.\s]?)?\(?[0-9]{3}\)?[-.\s]?[0-9]{3}[-.\s]?[0-9]{4}/g },
  { category: "ssn", pattern: /\b\d{3}-\d{2}-\d{4}\b/g },
  { category: "credit_card", pattern: /\b(?:\d{4}[-\s]?){3}\d{4}\b/g },
  { category: "ip_address", pattern: /\b(?:\d{1,3}\.){3}\d{1,3}\b/g },
];

/**
 * Scan text for PII patterns.
 */
export function scanForPII(text: string): PIIScanResult {
  const findings: PIIFinding[] = [];

  for (const { category, pattern } of PII_PATTERNS) {
    // Reset regex state
    pattern.lastIndex = 0;
    let match: RegExpExecArray | null;

    while ((match = pattern.exec(text)) !== null) {
      // Skip likely false positives for IP addresses (version numbers like 1.2.3.4)
      if (category === "ip_address" && isLikelyVersion(match[0])) {
        continue;
      }
      findings.push({
        category,
        match: match[0],
        position: match.index,
      });
    }
  }

  return {
    hasPII: findings.length > 0,
    findings,
    totalFindings: findings.length,
  };
}

/**
 * Redact PII from text, replacing matches with [REDACTED:category].
 */
export function redactPII(text: string): RedactedText {
  let redacted = text;
  let redactionCount = 0;
  const categories: PIICategory[] = [];

  for (const { category, pattern } of PII_PATTERNS) {
    pattern.lastIndex = 0;
    const matches = text.match(pattern);
    if (matches && matches.length > 0) {
      const filteredMatches = category === "ip_address"
        ? matches.filter((m) => !isLikelyVersion(m))
        : matches;

      for (const match of filteredMatches) {
        redacted = redacted.replace(match, `[REDACTED:${category}]`);
        redactionCount++;
        if (!categories.includes(category)) {
          categories.push(category);
        }
      }
    }
  }

  return { text: redacted, redactionCount, categories };
}

function isLikelyVersion(text: string): boolean {
  const parts = text.split(".");
  return parts.length === 4 && parts.every((p) => parseInt(p, 10) < 20);
}
