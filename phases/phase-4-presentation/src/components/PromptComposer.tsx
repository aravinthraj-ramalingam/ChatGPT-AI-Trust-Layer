import { FormEvent, useState } from "react";
import type { UsageCategory } from "../lib/stakes.js";
import { getUsageOption } from "../lib/stakes.js";
import "./PromptComposer.css";

interface PromptComposerProps {
  onSubmit: (content: string) => void;
  disabled?: boolean;
  initialValue?: string;
  variant?: "hero" | "dock";
  selectedUsage?: UsageCategory | null;
  onChangeStakes?: () => void;
}

/** Screen 1 — Prompt with optional stakes badge */
export function PromptComposer({
  onSubmit,
  disabled = false,
  initialValue = "",
  variant = "dock",
  selectedUsage = null,
  onChangeStakes,
}: PromptComposerProps) {
  const [value, setValue] = useState(initialValue);
  const usageLabel = selectedUsage
    ? getUsageOption(selectedUsage).shortLabel
    : null;

  function handleSubmit(e: FormEvent) {
    e.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || disabled) return;
    onSubmit(trimmed);
    setValue("");
  }

  return (
    <form
      className={`prompt-composer prompt-composer--${variant}`}
      onSubmit={handleSubmit}
      aria-label="Message composer"
    >
      <label htmlFor="prompt-input" className="sr-only">
        Your message
      </label>
      <div className="prompt-composer__inner">
        <textarea
          id="prompt-input"
          rows={1}
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="Ask anything"
          disabled={disabled}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              handleSubmit(e);
            }
          }}
        />
        {usageLabel && onChangeStakes && (
          <button
            type="button"
            className="prompt-composer__stakes"
            onClick={onChangeStakes}
            disabled={disabled}
            aria-label={`Stakes: ${usageLabel}. Click to change`}
            title="Change how you will use outputs"
          >
            <span className="prompt-composer__stakes-label">{usageLabel}</span>
            <span className="prompt-composer__stakes-chevron" aria-hidden="true">
              ▾
            </span>
          </button>
        )}
        <button
          type="submit"
          className="prompt-composer__send"
          disabled={disabled || !value.trim()}
          aria-label="Send message"
        >
          ↑
        </button>
      </div>
      {variant === "dock" && !selectedUsage && (
        <p className="prompt-composer__footnote">
          You will confirm how you plan to use the answer before it is generated.
        </p>
      )}
    </form>
  );
}
