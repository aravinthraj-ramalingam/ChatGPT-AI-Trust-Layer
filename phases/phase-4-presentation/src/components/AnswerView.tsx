import "./AnswerView.css";

interface AnswerViewProps {
  content: string;
  streaming?: boolean;
}

/** Screen 2 — Answer (with optional streaming state) */
export function AnswerView({ content, streaming = false }: AnswerViewProps) {
  return (
    <article className="answer-view" aria-live="polite" aria-busy={streaming}>
      <header className="answer-view__header">
        <span className="answer-view__role" aria-hidden="true">
          Assistant
        </span>
        {streaming && (
          <span className="answer-view__status" role="status">
            Writing…
          </span>
        )}
      </header>
      <div className="answer-view__body">
        {content.split("\n").map((line, i) => (
          <p key={i}>{line}</p>
        ))}
      </div>
    </article>
  );
}
