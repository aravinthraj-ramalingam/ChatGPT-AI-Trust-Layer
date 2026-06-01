import { useEffect, useRef } from "react";
import type { JudgmentResult } from "@ttj/phase-3-pipeline";
import { AssumptionCard } from "./AssumptionCard.js";
import { RiskCard } from "./RiskCard.js";
import { VerificationChecklist } from "./VerificationChecklist.js";
import { LayerFeedback } from "./LayerFeedback.js";
import "./JudgmentPanel.css";

export type JudgmentTab = "assumptions" | "risks" | "verify";

interface JudgmentPanelProps {
  judgment: JudgmentResult;
  activeTab: JudgmentTab;
  onTabChange: (tab: JudgmentTab) => void;
  doneVerificationIds: Set<string>;
  onToggleVerification: (id: string) => void;
  highlightVerificationFor?: string | null;
  onLayerFeedback: (
    signal: "positive" | "negative",
    comment: string
  ) => void;
}

/** L2/L3 — Assumptions, risks, verification tabs; feedback only in footer */
export function JudgmentPanel({
  judgment,
  activeTab,
  onTabChange,
  doneVerificationIds,
  onToggleVerification,
  highlightVerificationFor,
  onLayerFeedback,
}: JudgmentPanelProps) {
  const panelRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    panelRef.current?.focus();
  }, []);

  const tabs: { id: JudgmentTab; label: string; count: number }[] = [
    { id: "assumptions", label: "Assumptions", count: judgment.assumptions.length },
    { id: "risks", label: "Risks", count: judgment.risks.length },
    { id: "verify", label: "Verify", count: judgment.verifications.length },
  ];

  return (
    <div
      id="judgment-panel"
      ref={panelRef}
      className="judgment-panel"
      tabIndex={-1}
      role="region"
      aria-label="Judgment details"
    >
      <div className="judgment-panel__tabs" role="tablist" aria-label="Judgment sections">
        {tabs.map((tab) => (
          <button
            key={tab.id}
            type="button"
            role="tab"
            id={`tab-${tab.id}`}
            aria-selected={activeTab === tab.id}
            aria-controls={`panel-${tab.id}`}
            className={`judgment-panel__tab${activeTab === tab.id ? " is-active" : ""}`}
            onClick={() => onTabChange(tab.id)}
          >
            {tab.label}
            {tab.count > 0 && (
              <span className="judgment-panel__count" aria-hidden="true">
                {tab.count}
              </span>
            )}
          </button>
        ))}
      </div>

      <div
        id="panel-assumptions"
        role="tabpanel"
        aria-labelledby="tab-assumptions"
        hidden={activeTab !== "assumptions"}
        className="judgment-panel__content"
      >
        {judgment.assumptions.length === 0 ? (
          <p className="judgment-panel__empty">No assumptions surfaced for this answer.</p>
        ) : (
          <div className="judgment-panel__cards">
            {judgment.assumptions.map((a) => (
              <AssumptionCard key={a.id} assumption={a} />
            ))}
          </div>
        )}
      </div>

      <div
        id="panel-risks"
        role="tabpanel"
        aria-labelledby="tab-risks"
        hidden={activeTab !== "risks"}
        className="judgment-panel__content"
      >
        {judgment.risks.length === 0 ? (
          <p className="judgment-panel__empty">No decision-changing risks surfaced.</p>
        ) : (
          <div className="judgment-panel__cards">
            {judgment.risks.map((r) => (
              <RiskCard key={r.id} risk={r} />
            ))}
          </div>
        )}
      </div>

      <div
        id="panel-verify"
        role="tabpanel"
        aria-labelledby="tab-verify"
        hidden={activeTab !== "verify"}
        className="judgment-panel__content"
      >
        <VerificationChecklist
          items={judgment.verifications}
          doneIds={doneVerificationIds}
          onToggleDone={onToggleVerification}
          highlightId={highlightVerificationFor}
        />
      </div>

      <footer className="judgment-panel__footer">
        <LayerFeedback onSubmit={onLayerFeedback} />
      </footer>
    </div>
  );
}
