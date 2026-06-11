import type { CreateProjectPayload, Message, Notice, Project, SaveProjectPayload, User } from "../../shared/types";
import { ChatPane } from "./ChatPane";
import { Inspector } from "./Inspector";
import { Sidebar } from "./Sidebar";

interface WorkspaceProps {
  user: User;
  projects: Project[];
  activeProjectId: string | null;
  messages: Message[];
  notice: Notice | null;
  isBusy: boolean;
  isLoadingMessages: boolean;
  onLogout: () => Promise<void>;
  onSelectProject: (projectId: string) => Promise<void>;
  onCreateProject: (payload: CreateProjectPayload) => Promise<void>;
  onSaveProject: (payload: SaveProjectPayload) => Promise<void>;
  onSendMessage: (message: string) => Promise<void>;
  onUploadFile: (file: File) => Promise<void>;
}

export function Workspace({
  user,
  projects,
  activeProjectId,
  messages,
  notice,
  isBusy,
  isLoadingMessages,
  onLogout,
  onSelectProject,
  onCreateProject,
  onSaveProject,
  onSendMessage,
  onUploadFile
}: WorkspaceProps) {
  const activeProject = projects.find((project) => project.id === activeProjectId) || null;

  return (
    <main className="app-shell">
      <Sidebar
        user={user}
        projects={projects}
        activeProjectId={activeProjectId}
        onSelectProject={onSelectProject}
        onCreateProject={onCreateProject}
      />
      <ChatPane
        user={user}
        activeProject={activeProject}
        messages={messages}
        isBusy={isBusy}
        isLoadingMessages={isLoadingMessages}
        onLogout={onLogout}
        onSendMessage={onSendMessage}
      />
      <Inspector
        activeProject={activeProject}
        notice={notice}
        onSaveProject={onSaveProject}
        onUploadFile={onUploadFile}
      />
    </main>
  );
}
