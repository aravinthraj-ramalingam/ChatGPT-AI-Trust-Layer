import "./JudgmentChip.css";

export interface JudgmentCounts {
  assumptions: number;
  risks: number;
  verifications: number;
}

interface JudgmentChipProps {
  counts: JudgmentCounts;
  expanded: boolean;
  loading?: boolean;
  onToggle: () => void;
}

export function formatJudgmentChipLabel(counts: JudgmentCounts): string {
  const a = counts.assumptions;
  const r = counts.risks;
  const v = counts.verifications;
  return `${a} assumption${a === 1 ? "" : "s"} · ${r} risk${r === 1 ? "" : "s"} · ${v} verify`;
}

/** L1 entry — shows assumption / risk / verify counts (not "Judgment") */
export function JudgmentChip({
  counts,
  expanded,
  loading = false,
  onToggle,
}: JudgmentChipProps) {
  const label = formatJudgmentChipLabel(counts);
  const ariaLabel = loading
    ? "Analyzing assumptions, risks, and verification steps"
    : label;

  return (
    <button
      type="button"
      className="judgment-chip"
      aria-expanded={expanded}
      aria-controls="judgment-panel"
      aria-label={ariaLabel}
      onClick={onToggle}
      disabled={loading}
    >
      <span className="judgment-chip__counts" aria-hidden="true">
        {loading ? (
          "Analyzing…"
        ) : (
          <>
            <span className="judgment-chip__segment">
              <strong>{counts.assumptions}</strong> assumptions
            </span>
            <span className="judgment-chip__dot">·</span>
            <span className="judgment-chip__segment">
              <strong>{counts.risks}</strong> risks
            </span>
            <span className="judgment-chip__dot">·</span>
            <span className="judgment-chip__segment">
              <strong>{counts.verifications}</strong> verify
            </span>
          </>
        )}
      </span>
      <span className="judgment-chip__chevron" aria-hidden="true">
        {expanded ? "▾" : "▸"}
      </span>
    </button>
  );
}
