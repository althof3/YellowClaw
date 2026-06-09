import { FormEvent, useEffect, useRef, useState } from "react";
import type { Message, Project, User } from "../../shared/types";
import { AiIcon, MessageBubble } from "./MessageBubble";

interface ChatPaneProps {
  user: User;
  activeProject: Project | null;
  messages: Message[];
  isBusy: boolean;
  onLogout: () => Promise<void>;
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatPane({ user, activeProject, messages, isBusy, onLogout, onSendMessage }: ChatPaneProps) {
  const [messageDraft, setMessageDraft] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages, isBusy]);

  async function handleChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!messageDraft.trim()) return;
    const message = messageDraft.trim();
    setMessageDraft("");
    await onSendMessage(message);
  }

  return (
    <section className="chat-pane">
      <header className="topbar">
        <div className="topbar-title">
          <h2>{activeProject?.name || "No agent selected"}</h2>
          <p>{activeProject ? "OpenRouter chat workspace" : "Create an agent to begin"}</p>
        </div>
        <div className="account">
          <span>{user.name || user.email}</span>
          <button className="secondary-btn" onClick={onLogout} type="button">
            Logout
          </button>
        </div>
      </header>

      <div className="messages" ref={messagesRef}>
        {messages.length ? (
          <>
            {messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))}
            {isBusy && (
              <article className="message" aria-live="polite" aria-label="Agent is typing">
                <div className="avatar"><AiIcon /></div>
                <div className="bubble typing">
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                  <span className="typing-dot" />
                </div>
              </article>
            )}
          </>
        ) : (
          <div className="empty-state">
            <div>
              <h3>Start with a useful test message.</h3>
              <p>The agent will answer using the saved System Prompt. Update the prompt on the right, save it, then test the behavior here.</p>
            </div>
          </div>
        )}
      </div>

      <form className="composer" onSubmit={handleChat}>
        <textarea
          value={messageDraft}
          onChange={(event) => setMessageDraft(event.target.value)}
          placeholder="Message this agent"
          disabled={!activeProject || isBusy}
        />
        <button className="primary-btn" type="submit" disabled={!activeProject || isBusy}>
          {isBusy ? "Sending" : "Send"}
        </button>
      </form>
    </section>
  );
}
