import { useState } from "react";
import type { Assumption } from "@ttj/phase-1-foundation";
import "./JudgmentCard.css";

interface AssumptionCardProps {
  assumption: Assumption;
}

/** Screen 3 — Assumption */
export function AssumptionCard({ assumption }: AssumptionCardProps) {
  const [whyOpen, setWhyOpen] = useState(false);
  const impactLevel = assumption.impactLevel ?? "medium";
  const badgeClass = `judgment-card__badge judgment-card__badge--${impactLevel}`;

  return (
    <article className="judgment-card" aria-labelledby={`asm-${assumption.id}`}>
      <h4 id={`asm-${assumption.id}`} className="judgment-card__title">
        {assumption.statement}
      </h4>
      <p className="judgment-card__impact">
        <span className={badgeClass}>{impactLevel} impact</span>
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
    </article>
  );
}
