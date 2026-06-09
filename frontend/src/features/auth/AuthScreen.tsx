import { FormEvent, useState } from "react";
import { Brand } from "../../components/common/Brand";
import { NoticeBox } from "../../components/common/NoticeBox";
import type { AuthMode, AuthPayload, Notice } from "../../shared/types";

interface AuthScreenProps {
  authMode: AuthMode;
  notice: Notice | null;
  onModeChange: (mode: AuthMode) => void;
  onSubmit: (payload: AuthPayload) => Promise<void>;
}

export function AuthScreen({ authMode, notice, onModeChange, onSubmit }: AuthScreenProps) {
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    setIsSubmitting(true);
    try {
      await onSubmit({
        name: String(form.get("name") || ""),
        email: String(form.get("email") || ""),
        password: String(form.get("password") || "")
      });
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <main className="auth-shell">
      <section className="auth-preview">
        <Brand />
        <div className="auth-story">
          <h1>Build agents around the prompts your team trusts.</h1>
          <p>
            Create user-owned chatbot projects, keep every system prompt attached to the right agent,
            and test the conversation loop in one focused workspace.
          </p>
          <ul className="feature-list">
            <li>
              <div>
                <strong>Own your agents</strong>
                <span>Each chatbot project belongs to your account.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Tune system prompts</strong>
                <span>Keep every prompt attached to the right agent.</span>
              </div>
            </li>
            <li>
              <div>
                <strong>Test the loop</strong>
                <span>Run the conversation in one focused workspace.</span>
              </div>
            </li>
          </ul>
        </div>
        <p className="small muted">Email and password authentication. OpenRouter-ready workspace.</p>
      </section>

      <section className="auth-panel">
        <div className="auth-card">
          <div className="auth-tabs" role="tablist" aria-label="Authentication mode">
            <button
              className={`auth-tab ${authMode === "login" ? "active" : ""}`}
              onClick={() => onModeChange("login")}
              type="button"
            >
              Login
            </button>
            <button
              className={`auth-tab ${authMode === "register" ? "active" : ""}`}
              onClick={() => onModeChange("register")}
              type="button"
            >
              Register
            </button>
          </div>
          <form className="form" onSubmit={handleSubmit}>
            {authMode === "register" && (
              <div className="field">
                <label htmlFor="name">Name</label>
                <input id="name" name="name" autoComplete="name" placeholder="Yellow Team" />
              </div>
            )}
            <div className="field">
              <label htmlFor="email">Email</label>
              <input id="email" name="email" type="email" autoComplete="email" placeholder="you@company.com" required />
            </div>
            <div className="field">
              <label htmlFor="password">Password</label>
              <input
                id="password"
                name="password"
                type="password"
                autoComplete={authMode === "login" ? "current-password" : "new-password"}
                placeholder="Minimum 8 characters"
                required
              />
            </div>
            <NoticeBox notice={notice} />
            <button className="primary-btn" type="submit" disabled={isSubmitting}>
              {isSubmitting ? "Working" : authMode === "login" ? "Login" : "Create account"}
            </button>
          </form>
        </div>
      </section>
    </main>
  );
}
