import { FormEvent, useState } from "react";
import "./LayerFeedback.css";

interface LayerFeedbackProps {
  onSubmit: (signal: "positive" | "negative", comment: string) => void;
}

/** Layer feedback with comment + thumbs */
export function LayerFeedback({ onSubmit }: LayerFeedbackProps) {
  const [comment, setComment] = useState("");
  const [submitted, setSubmitted] = useState<"positive" | "negative" | null>(null);

  function handleThumb(signal: "positive" | "negative") {
    setSubmitted(signal);
    onSubmit(signal, comment.trim());
  }

  function handleCommentSubmit(e: FormEvent) {
    e.preventDefault();
    if (submitted) return;
    if (comment.trim()) {
      onSubmit("positive", comment.trim());
      setSubmitted("positive");
    }
  }

  return (
    <div className="layer-feedback">
      <p className="layer-feedback__label" id="layer-feedback-label">
        Was this judgment layer helpful?
      </p>
      <form
        className="layer-feedback__form"
        onSubmit={handleCommentSubmit}
        aria-labelledby="layer-feedback-label"
      >
        <input
          type="text"
          className="layer-feedback__input"
          placeholder="Optional feedback…"
          value={comment}
          onChange={(e) => setComment(e.target.value)}
          disabled={submitted !== null}
          aria-label="Additional feedback"
        />
        <div className="layer-feedback__thumbs" role="group" aria-label="Rate helpfulness">
          <button
            type="button"
            className={`layer-feedback__thumb${submitted === "positive" ? " is-active" : ""}`}
            aria-label="Thumbs up — helpful"
            aria-pressed={submitted === "positive"}
            disabled={submitted !== null}
            onClick={() => handleThumb("positive")}
          >
            <span aria-hidden="true">👍</span>
          </button>
          <button
            type="button"
            className={`layer-feedback__thumb${submitted === "negative" ? " is-active" : ""}`}
            aria-label="Thumbs down — not helpful"
            aria-pressed={submitted === "negative"}
            disabled={submitted !== null}
            onClick={() => handleThumb("negative")}
          >
            <span aria-hidden="true">👎</span>
          </button>
        </div>
      </form>
      {submitted && (
        <p className="layer-feedback__thanks" role="status">
          Thanks for your feedback
        </p>
      )}
    </div>
  );
}
