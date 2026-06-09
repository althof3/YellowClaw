import { useState } from "react";
import { Brand } from "../../components/common/Brand";
import { initials } from "../../shared/initials";
import type { CreateProjectPayload, Project, User } from "../../shared/types";
import { CreateAgentModal } from "./CreateAgentModal";

interface SidebarProps {
  user: User;
  projects: Project[];
  activeProjectId: string | null;
  onSelectProject: (projectId: string) => Promise<void>;
  onCreateProject: (payload: CreateProjectPayload) => Promise<void>;
}

export function Sidebar({ user, projects, activeProjectId, onSelectProject, onCreateProject }: SidebarProps) {
  const [showCreateModal, setShowCreateModal] = useState(false);

  return (
    <aside className="sidebar">
      <div className="sidebar-head">
        <Brand />
        <button className="icon-btn" onClick={() => setShowCreateModal(true)} type="button" title="New Agent">
          +
        </button>
      </div>

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

      <button className="primary-btn full-width" onClick={() => setShowCreateModal(true)} type="button">
        New Agent
      </button>

      <div className="sidebar-foot">
        <strong>{user.email}</strong>
      </div>

      {showCreateModal && (
        <CreateAgentModal onClose={() => setShowCreateModal(false)} onCreate={onCreateProject} />
      )}
    </aside>
  );
}
