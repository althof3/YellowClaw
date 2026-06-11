import { FormEvent, KeyboardEvent, useEffect, useRef, useState } from "react";
import type { Message, Project, User } from "../../shared/types";
import { AiIcon, MessageBubble } from "./MessageBubble";

interface ChatPaneProps {
  user: User;
  activeProject: Project | null;
  messages: Message[];
  isBusy: boolean;
  isLoadingMessages: boolean;
  onLogout: () => Promise<void>;
  onSendMessage: (message: string) => Promise<void>;
}

export function ChatPane({
  user,
  activeProject,
  messages,
  isBusy,
  isLoadingMessages,
  onLogout,
  onSendMessage
}: ChatPaneProps) {
  const [messageDraft, setMessageDraft] = useState("");
  const messagesRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    messagesRef.current?.scrollTo({ top: messagesRef.current.scrollHeight });
  }, [messages, isBusy]);

  async function sendDraft() {
    if (isLoadingMessages || !messageDraft.trim()) return;
    const message = messageDraft.trim();
    setMessageDraft("");
    await onSendMessage(message);
  }

  async function handleChat(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    await sendDraft();
  }

  function handleDraftKeyDown(event: KeyboardEvent<HTMLTextAreaElement>) {
    if (event.key !== "Enter" || event.shiftKey || event.nativeEvent.isComposing) return;
    event.preventDefault();
    void sendDraft();
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
        {isLoadingMessages ? (
          <div className="chat-skeleton" aria-label="Loading chat history" aria-live="polite">
            <div className="chat-skeleton-row">
              <span className="chat-skeleton-avatar" />
              <span className="chat-skeleton-bubble chat-skeleton-bubble-wide" />
            </div>
            <div className="chat-skeleton-row user">
              <span className="chat-skeleton-avatar" />
              <span className="chat-skeleton-bubble chat-skeleton-bubble-short" />
            </div>
            <div className="chat-skeleton-row">
              <span className="chat-skeleton-avatar" />
              <span className="chat-skeleton-bubble" />
            </div>
          </div>
        ) : messages.length ? (
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
        <div className="composer-field">
          <textarea
            value={messageDraft}
            onChange={(event) => setMessageDraft(event.target.value)}
            onKeyDown={handleDraftKeyDown}
            placeholder="Message this agent"
            disabled={!activeProject || isBusy || isLoadingMessages}
          />
          <span className="composer-hint">
            <span><kbd>Enter</kbd> to send</span>
            <span><kbd>Shift+Enter</kbd> for new line</span>
          </span>
        </div>
        <button className="primary-btn" type="submit" disabled={!activeProject || isBusy || isLoadingMessages}>
          {isLoadingMessages ? "Loading" : isBusy ? "Sending" : "Send"}
        </button>
      </form>
    </section>
  );
}
