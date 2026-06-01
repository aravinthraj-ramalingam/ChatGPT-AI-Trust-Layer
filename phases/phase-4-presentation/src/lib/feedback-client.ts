import { FeedbackEngine } from "@ttj/phase-5-feedback";
import type { FeedbackSignal } from "@ttj/phase-1-foundation";

let localEngine: FeedbackEngine | null = null;

function getLocalEngine(): FeedbackEngine {
  if (!localEngine) {
    localEngine = new FeedbackEngine();
  }
  return localEngine;
}

const API_BASE =
  typeof import.meta.env.VITE_TTJ_API === "string"
    ? import.meta.env.VITE_TTJ_API.replace(/\/$/, "")
    : "";

export interface SubmitLayerFeedbackResult {
  ok: boolean;
  via: "api" | "local";
}

/** Submit layer-only feedback (footer); uses API when configured */
export async function submitLayerFeedback(
  answerId: string,
  signal: FeedbackSignal,
  comment: string
): Promise<SubmitLayerFeedbackResult> {
  const payload = {
    answerId,
    targetType: "layer" as const,
    targetId: null,
    signal,
    comment: comment || undefined,
  };

  if (API_BASE) {
    try {
      const res = await fetch(`${API_BASE}/feedback`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      if (res.ok) {
        return { ok: true, via: "api" };
      }
    } catch {
      /* fall through to local */
    }
  }

  getLocalEngine().submit(payload, { layerOnly: true });
  return { ok: true, via: "local" };
}
