import { FormEvent, useState } from "react";
import { Brand } from "../../components/common/Brand";
import { initials } from "../../shared/initials";
import type { CreateProjectPayload, Project, User } from "../../shared/types";

interface SidebarProps {
  user: User;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => Promise<void>;
  onCreateProject: (payload: CreateProjectPayload) => Promise<void>;
}

export function Sidebar({ user, projects, activeProjectId, onSelectProject, onCreateProject }: SidebarProps) {
  const [newAgentName, setNewAgentName] = useState("");
  const [showCreateForm, setShowCreateForm] = useState(false);

  async function handleCreate(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (!newAgentName.trim()) return;
    await onCreateProject({
      name: newAgentName,
      systemPrompt: "You qualify inbound leads. Ask one question at a time and summarize the next best action."
    });
    setNewAgentName("");
    setShowCreateForm(false);
  }

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <Brand />
        <button className="icon-btn" onClick={() => setShowCreateForm((value) => !value)} type="button" title="New Agent">
          +
        </button>
      </div>

      {showCreateForm && (
        <form className="create-agent" onSubmit={handleCreate}>
          <div className="field">
            <label htmlFor="newAgentName">Agent name</label>
            <input
              id="newAgentName"
              value={newAgentName}
              onChange={(event) => setNewAgentName(event.target.value)}
              placeholder="Sales Qualifier"
            />
          </div>
          <button className="primary-btn" type="submit">
            New Agent
          </button>
        </form>
      )}

      <div className="agent-list">
        {projects.map((project) => (
          <button
            className={`agent-row ${project.id === activeProjectId ? "active" : ""}`}
            key={project.id}
            onClick={() => onSelectProject(project.id)}
            type="button"
          >
            <span className="agent-glyph">{initials(project.name)}</span>
            <span className="agent-meta">
              <span className="agent-name">{project.name}</span>
            </span>
          </button>
        ))}
      </div>

      {!showCreateForm && (
        <button className="primary-btn full-width" onClick={() => setShowCreateForm(true)} type="button">
          New Agent
        </button>
      )}

      <div className="sidebar-foot">
        <strong>{user.email}</strong>
      </div>
    </aside>
  );
}
