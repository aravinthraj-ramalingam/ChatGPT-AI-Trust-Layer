import type { VerificationAction } from "@ttj/phase-1-foundation";
import "./VerificationChecklist.css";

interface VerificationChecklistProps {
  items: VerificationAction[];
  doneIds: Set<string>;
  onToggleDone: (id: string) => void;
  highlightId?: string | null;
}

/** Screen 5 — Verification actions */
export function VerificationChecklist({
  items,
  doneIds,
  onToggleDone,
  highlightId,
}: VerificationChecklistProps) {
  if (items.length === 0) {
    return (
      <p className="verification-empty" role="status">
        No verification steps for this answer.
      </p>
    );
  }

  return (
    <ul className="verification-list" aria-label="Verification checklist">
      {items.map((item) => {
        const done = doneIds.has(item.id);
        const highlighted = highlightId === item.linkedEntityId;

        return (
          <li
            key={item.id}
            className={`verification-item${highlighted ? " verification-item--highlight" : ""}${done ? " verification-item--done" : ""}`}
            id={`ver-${item.id}`}
          >
            <label className="verification-item__label">
              <input
                type="checkbox"
                checked={done}
                onChange={() => onToggleDone(item.id)}
                aria-describedby={`ver-desc-${item.id}`}
              />
              <span>{item.actionText}</span>
            </label>
            <p id={`ver-desc-${item.id}`} className="verification-item__meta">
              Effort: {item.effort === "quick" ? "Quick (~5 min)" : "Moderate (~15 min)"}
              {" · "}
              Linked to {item.linkedEntityType}
            </p>
          </li>
        );
      })}
    </ul>
  );
}
