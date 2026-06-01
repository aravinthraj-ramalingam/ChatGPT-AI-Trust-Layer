import { useState } from "react";
import {
  USAGE_OPTIONS,
  type UsageCategory,
  type UsageOption,
} from "../lib/stakes.js";
import "./StakesConfirmation.css";

interface StakesConfirmationProps {
  mode?: "prompt" | "edit";
  promptPreview?: string;
  suggestedUsage: UsageCategory;
  detectionHint?: string;
  onConfirm: (usage: UsageCategory) => void;
  onCancel: () => void;
}

/** "How will you use this output?" — stakes confirmation before answer */
export function StakesConfirmation({
  mode = "prompt",
  promptPreview = "",
  suggestedUsage,
  detectionHint = "",
  onConfirm,
  onCancel,
}: StakesConfirmationProps) {
  const [selected, setSelected] = useState<UsageCategory>(suggestedUsage);
  const isEdit = mode === "edit";

  return (
    <div
      className="stakes-overlay"
      role="dialog"
      aria-modal="true"
      aria-labelledby="stakes-title"
    >
      <div className="stakes-dialog">
        <h2 id="stakes-title" className="stakes-dialog__title">
          {isEdit ? "Change stakes for this chat" : "How will you use this output?"}
        </h2>
        {!isEdit && detectionHint && (
          <p className="stakes-dialog__hint">
            <span className="stakes-dialog__detected">{detectionHint}</span>
            {" — "}
            confirm or choose below.
          </p>
        )}
        {isEdit && (
          <p className="stakes-dialog__hint">
            Applies to your next messages in this conversation.
          </p>
        )}
        {!isEdit && promptPreview && (
          <p className="stakes-dialog__preview" title={promptPreview}>
            {promptPreview.length > 120
              ? `${promptPreview.slice(0, 117)}…`
              : promptPreview}
          </p>
        )}

        <div
          className="stakes-options"
          role="radiogroup"
          aria-label="Usage and stakes level"
        >
          {USAGE_OPTIONS.map((option) => (
            <UsagePill
              key={option.id}
              option={option}
              selected={selected === option.id}
              suggested={suggestedUsage === option.id}
              onSelect={() => setSelected(option.id)}
            />
          ))}
        </div>

        <div className="stakes-dialog__actions">
          <button type="button" className="btn-ghost" onClick={onCancel}>
            Cancel
          </button>
          <button
            type="button"
            className="btn-primary"
            onClick={() => onConfirm(selected)}
          >
            {isEdit ? "Save stakes" : "Confirm & get answer"}
          </button>
        </div>
      </div>
    </div>
  );
}

function UsagePill({
  option,
  selected,
  suggested,
  onSelect,
}: {
  option: UsageOption;
  selected: boolean;
  suggested: boolean;
  onSelect: () => void;
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      className={`stakes-pill${selected ? " stakes-pill--selected" : ""}${suggested ? " stakes-pill--suggested" : ""}`}
      onClick={onSelect}
    >
      <span className="stakes-pill__label">{option.label}</span>
      <span className="stakes-pill__desc">{option.description}</span>
      {suggested && !selected && (
        <span className="stakes-pill__badge">Suggested</span>
      )}
    </button>
  );
}
