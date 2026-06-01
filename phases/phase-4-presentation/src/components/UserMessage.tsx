import "./UserMessage.css";

export function UserMessage({ content }: { content: string }) {
  return (
    <article className="user-message" aria-label="Your message">
      <p>{content}</p>
    </article>
  );
}
