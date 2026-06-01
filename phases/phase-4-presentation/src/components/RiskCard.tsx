import { useState } from "react";
import type { DecisionRisk } from "@ttj/phase-1-foundation";
import "./JudgmentCard.css";

interface RiskCardProps {
  risk: DecisionRisk;
  onGoToVerification?: (linkedId: string) => void;
}

/** Screen 4 — Decision risk */
export function RiskCard({ risk, onGoToVerification }: RiskCardProps) {
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <article
      className="judgment-card judgment-card--risk"
      aria-labelledby={`risk-${risk.id}`}
    >
      <h4 id={`risk-${risk.id}`} className="judgment-card__title">
        {risk.description}
      </h4>
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
      {onGoToVerification && (
        <div className="judgment-card__footer">
          <button
            type="button"
            className="judgment-card__link"
            onClick={() => onGoToVerification(risk.id)}
          >
            Verify →
          </button>
        </div>
      )}
    </article>
  );
}
