import { useState } from "react";
import type { Assumption } from "@ttj/phase-1-foundation";
import "./JudgmentCard.css";

interface AssumptionCardProps {
  assumption: Assumption;
  onGoToVerification?: (linkedId: string) => void;
}

/** Screen 3 — Assumption */
export function AssumptionCard({
  assumption,
  onGoToVerification,
}: AssumptionCardProps) {
  const [whyOpen, setWhyOpen] = useState(false);

  return (
    <article className="judgment-card" aria-labelledby={`asm-${assumption.id}`}>
      <h4 id={`asm-${assumption.id}`} className="judgment-card__title">
        {assumption.statement}
      </h4>
      <p className="judgment-card__impact">
        <span className="judgment-card__badge">{assumption.impactLevel ?? "medium"} impact</span>
        — Changes recommendation if false
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
        <p className="judgment-card__why-text">{assumption.showReason}</p>
      )}
      {onGoToVerification && (
        <div className="judgment-card__footer">
          <button
            type="button"
            className="judgment-card__link"
            onClick={() => onGoToVerification(assumption.id)}
          >
            Go to verification →
          </button>
        </div>
      )}
    </article>
  );
}
