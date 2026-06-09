import type { Message } from "../../shared/types";

function UserIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 12a4 4 0 1 0 0-8 4 4 0 0 0 0 8ZM5 20a7 7 0 0 1 14 0"
        stroke="currentColor"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

export function AiIcon() {
  return (
    <svg width="16" height="16" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d="M12 3l1.6 4.4L18 9l-4.4 1.6L12 15l-1.6-4.4L6 9l4.4-1.6L12 3ZM18 14l.8 2.2L21 17l-2.2.8L18 20l-.8-2.2L15 17l2.2-.8L18 14Z"
        fill="currentColor"
      />
    </svg>
  );
}

export function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";
  return (
    <article className={`message ${isUser ? "user" : ""}`}>
      <div className="avatar">{isUser ? <UserIcon /> : <AiIcon />}</div>
      <div className="bubble">{message.content}</div>
    </article>
  );
}
