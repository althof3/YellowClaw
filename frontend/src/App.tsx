import { AuthScreen } from "./features/auth/AuthScreen";
import { Workspace } from "./features/workspace/Workspace";
import { useYellowClawApp } from "./hooks/useYellowClawApp";

export default function App() {
  const app = useYellowClawApp();

  if (app.isInitializing) {
    return (
      <main className="app-loading" aria-label="Loading workspace">
        <div className="app-loading-card">
          <div className="app-loading-mark">YC</div>
          <strong>Loading your workspace</strong>
          <span>Restoring your session and agents.</span>
          <div className="app-loading-dots" aria-hidden="true">
            <i />
            <i />
            <i />
          </div>
        </div>
      </main>
    );
  }

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
      isLoadingMessages={app.isLoadingMessages}
      onLogout={app.handleLogout}
      onSelectProject={app.handleSelectProject}
      onCreateProject={app.handleCreateProject}
      onSaveProject={app.handleSaveProject}
      onSendMessage={app.handleSendMessage}
      onUploadFile={app.handleUploadFile}
    />
  );
}
