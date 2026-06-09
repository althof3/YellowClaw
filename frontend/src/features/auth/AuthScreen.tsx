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
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const isLogin = authMode === "login";

  function openDialog(mode: AuthMode) {
    onModeChange(mode);
    setIsDialogOpen(true);
  }

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
        <div className="auth-orb auth-orb-one" aria-hidden="true" />
        <div className="auth-orb auth-orb-two" aria-hidden="true" />
        <Brand />
        <div className="auth-hero">
          <div className="auth-story">
            <span className="eyebrow">YellowClaw Control Surface</span>
            <h1>
              Prompt ops for teams that need a cleaner way to ship, test, and steer AI agents.
            </h1>
            <p>
              Build user-owned agent workspaces, keep the right system prompt attached to every project,
              and move from setup to live conversation without leaving the same operating surface.
            </p>
            <div className="hero-actions">
              <button className="primary-btn" type="button" onClick={() => openDialog("login")}>
                Login to Center
              </button>
              <button className="secondary-btn hero-secondary" type="button" onClick={() => openDialog("register")}>
                Create Account
              </button>
            </div>
            <div className="hero-stats" aria-label="Highlights">
              <div className="hero-stat">
                <strong>1 workspace</strong>
                <span>Prompt, files, chat, and agent config in one place.</span>
              </div>
              <div className="hero-stat">
                <strong>Email auth</strong>
                <span>Fast team access with plain email and password.</span>
              </div>
              <div className="hero-stat">
                <strong>OpenRouter-ready</strong>
                <span>Built to plug into your current model workflow.</span>
              </div>
            </div>
            <ul className="feature-list">
              <li>
                <div>
                  <strong>Own your agents</strong>
                  <span>Every chatbot project stays tied to the right operator.</span>
                </div>
              </li>
              <li>
                <div>
                  <strong>Tune system prompts</strong>
                  <span>Version the instruction layer without losing the chat loop.</span>
                </div>
              </li>
              <li>
                <div>
                  <strong>Test the loop</strong>
                  <span>Go from agent setup to a live response in the same center.</span>
                </div>
              </li>
            </ul>
          </div>
          <div className="auth-showcase" aria-hidden="true">
            <div className="showcase-panel showcase-panel-primary">
              <div className="showcase-topbar">
                <span className="showcase-label">Control Center</span>
                <span className="showcase-live">Live</span>
              </div>
              <strong>YellowBot Customer Service</strong>
              <div className="showcase-window">
                <div className="showcase-sidebar">
                  <span className="mini-agent active">YC</span>
                  <span className="mini-agent">SB</span>
                  <span className="mini-agent">QA</span>
                </div>
                <div className="showcase-chat">
                  <span className="chat-line short" />
                  <span className="chat-line" />
                  <span className="chat-line accent" />
                  <span className="chat-input" />
                </div>
              </div>
            </div>
            <div className="showcase-grid">
              <div className="showcase-panel">
                <span className="showcase-label">Prompt Stack</span>
                <strong>System prompts stay visible</strong>
              </div>
              <div className="showcase-panel">
                <span className="showcase-label">Context Files</span>
                <strong>3 docs attached</strong>
              </div>
            </div>
          </div>
        </div>
        <p className="small muted">Email and password authentication. Workspace access opens immediately after login.</p>
      </section>

      {isDialogOpen && (
        <section className="auth-panel" onClick={() => setIsDialogOpen(false)}>
          <div className="auth-card" onClick={(event) => event.stopPropagation()} role="dialog" aria-modal="true" aria-labelledby="auth-dialog-title">
            <div className="auth-card-head">
              <div>
                <span className="eyebrow">Secure Access</span>
                <h2 id="auth-dialog-title">{isLogin ? "Enter the center" : "Create your center access"}</h2>
                <p>{isLogin ? "Log in to continue into your workspace." : "Register an account, then jump straight into the workspace."}</p>
              </div>
              <button className="auth-close" type="button" onClick={() => setIsDialogOpen(false)} aria-label="Close login dialog">
                x
              </button>
            </div>
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
                {isSubmitting ? "Working" : isLogin ? "Login to Center" : "Create account"}
              </button>
            </form>
          </div>
        </section>
      )}
    </main>
  );
}
