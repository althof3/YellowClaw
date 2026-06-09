import { AuthScreen } from "./features/auth/AuthScreen";
import { Workspace } from "./features/workspace/Workspace";
import { useYellowClawApp } from "./hooks/useYellowClawApp";

export default function App() {
  const app = useYellowClawApp();

  if (!app.user) {
    return <AuthScreen authMode={app.authMode} notice={app.notice} onModeChange={app.setAuthMode} onSubmit={app.handleAuthSubmit} />;
  }

  return (
    <Workspace
      user={app.user}
      projects={app.projects}
      activeProjectId={app.activeProjectId}
      messages={app.messages}
      notice={app.notice}
      isBusy={app.isBusy}
      onLogout={app.handleLogout}
      onSelectProject={app.handleSelectProject}
      onCreateProject={app.handleCreateProject}
      onSaveProject={app.handleSaveProject}
      onSendMessage={app.handleSendMessage}
      onUploadFile={app.handleUploadFile}
    />
  );
}
