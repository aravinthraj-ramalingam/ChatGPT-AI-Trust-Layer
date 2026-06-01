import { useState } from "react";
import type { DecisionRisk } from "@ttj/phase-1-foundation";
import "./JudgmentCard.css";

interface RiskCardProps {
  risk: DecisionRisk;
}

/** Screen 4 — Decision risk */
export function RiskCard({ risk }: RiskCardProps) {
  const [whyOpen, setWhyOpen] = useState(false);
  const impactScore = risk.impactScore;
  const level = impactScore >= 0.85 ? "very-high" : impactScore >= 0.7 ? "high" : "medium";
  const badgeClass = `judgment-card__badge judgment-card__badge--${level}`;

  return (
    <article
      className="judgment-card judgment-card--risk"
      aria-labelledby={`risk-${risk.id}`}
    >
      <h4 id={`risk-${risk.id}`} className="judgment-card__title">
        {risk.description}
      </h4>
      <p className="judgment-card__impact">
        <span className={badgeClass}>{level.replace("-", " ")} risk</span>
      </p>
      <p className="judgment-card__meta">
        <strong>If true:</strong> {risk.decisionImpact}
      </p>
      <p className="judgment-card__meta">
        <strong>Trigger:</strong> {risk.triggerCondition}
      </p>
      <button
        type="button"
        className="judgment-card__why"
        aria-expanded={whyOpen}
        onClick={() => setWhyOpen((o) => !o)}
      >
        Why shown {whyOpen ? "▾" : "▸"}
      </button>
      {whyOpen && (
        <p className="judgment-card__why-text">{risk.showReason}</p>
      )}
    </article>
  );
}
