import { useEffect, useRef, useState } from "react";
import { authenticate, getCurrentUser, logout } from "../services/authService";
import { sendMessage } from "../services/chatService";
import { uploadProjectFile } from "../services/fileService";
import { createProject, listMessages, listProjects, updateProject } from "../services/projectService";
import type {
  AuthMode,
  AuthPayload,
  CreateProjectPayload,
  Message,
  Notice,
  Project,
  SaveProjectPayload,
  User
} from "../shared/types";

export function useYellowClawApp() {
  const [authMode, setAuthMode] = useState<AuthMode>("login");
  const [user, setUser] = useState<User | null>(null);
  const [projects, setProjects] = useState<Project[]>([]);
  const [activeProjectId, setActiveProjectId] = useState<string | null>(null);
  const [messages, setMessages] = useState<Message[]>([]);
  const [notice, setNotice] = useState<Notice | null>(null);
  const [isBusy, setIsBusy] = useState(false);
  const [isInitializing, setIsInitializing] = useState(true);
  const [isLoadingMessages, setIsLoadingMessages] = useState(false);
  const messageRequestId = useRef(0);

  async function loadProjectMessages(projectId: string) {
    const requestId = ++messageRequestId.current;
    setMessages([]);
    setIsLoadingMessages(true);
    try {
      const payload = await listMessages(projectId);
      if (requestId === messageRequestId.current) {
        setMessages(payload.messages);
      }
    } finally {
      if (requestId === messageRequestId.current) {
        setIsLoadingMessages(false);
      }
    }
  }

  async function loadProjects(preferredProjectId?: string) {
    const payload = await listProjects();
    setProjects(payload.projects);
    const nextProjectId = preferredProjectId || activeProjectId || payload.projects[0]?.id || null;
    setActiveProjectId(nextProjectId);
    if (nextProjectId) {
      await loadProjectMessages(nextProjectId);
    } else {
      setMessages([]);
      setIsLoadingMessages(false);
    }
  }

  useEffect(() => {
    let isMounted = true;

    async function initialize() {
      try {
        const payload = await getCurrentUser();
        if (!isMounted) return;
        setUser(payload.user);
        if (!payload.user) {
          setIsLoadingMessages(false);
          return;
        }

        const projectsPayload = await listProjects();
        if (!isMounted) return;
        setProjects(projectsPayload.projects);
        const nextProjectId = projectsPayload.projects[0]?.id || null;
        setActiveProjectId(nextProjectId);
        if (nextProjectId) {
          setIsLoadingMessages(true);
          setIsInitializing(false);
          try {
            await loadProjectMessages(nextProjectId);
          } catch (error) {
            if (isMounted) {
              setNotice({ message: error instanceof Error ? error.message : "Chat history failed to load" });
            }
          }
        } else {
          setIsLoadingMessages(false);
        }
      } catch {
        if (isMounted) {
          setUser(null);
          setIsLoadingMessages(false);
        }
      } finally {
        if (isMounted) setIsInitializing(false);
      }
    }

    void initialize();
    return () => {
      isMounted = false;
    };
  }, []);

  async function handleAuthSubmit(payload: AuthPayload) {
    try {
      const response = await authenticate(authMode, payload);
      setUser(response.user);
      setNotice(null);
      setIsLoadingMessages(true);
      await loadProjects(response.project?.id);
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "Authentication failed" });
    }
  }

  async function handleLogout() {
    await logout();
    setUser(null);
    setProjects([]);
    setActiveProjectId(null);
    setMessages([]);
    setNotice(null);
    setIsLoadingMessages(false);
  }

  async function handleSelectProject(projectId: string) {
    setActiveProjectId(projectId);
    setNotice(null);
    await loadProjectMessages(projectId);
  }

  async function handleCreateProject(payload: CreateProjectPayload) {
    const { files, ...projectPayload } = payload;
    let response: { project: Project };
    try {
      response = await createProject(projectPayload);
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "Agent creation failed" });
      throw error;
    }
    setProjects((items) => [response.project, ...items]);
    setActiveProjectId(response.project.id);
    setMessages([]);

    if (files && files.length) {
      try {
        await Promise.all(files.map((file) => uploadProjectFile(response.project.id, file)));
        setNotice({ message: `Agent created with ${files.length} file(s).`, success: true });
      } catch (error) {
        setNotice({ message: error instanceof Error ? error.message : "Agent created, but file upload failed" });
      }
      return;
    }

    setNotice({ message: "Agent created.", success: true });
  }

  async function handleSaveProject(payload: SaveProjectPayload) {
    try {
      const response = await updateProject(payload);
      setProjects((items) => items.map((item) => (item.id === response.project.id ? response.project : item)));
      setNotice({ message: "Project saved.", success: true });
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "Save failed" });
    }
  }

  async function handleSendMessage(message: string) {
    if (!activeProjectId) return;
    const tempMessage: Message = {
      id: `temp_${Date.now()}`,
      role: "user",
      content: message,
      createdAt: new Date().toISOString()
    };
    setIsBusy(true);
    setNotice(null);
    setMessages((items) => [...items, tempMessage]);
    try {
      const response = await sendMessage(activeProjectId, message);
      setMessages((items) => items.filter((item) => !item.id.startsWith("temp_")).concat(response.messages));
      const updatedAt = response.messages.at(-1)?.createdAt || new Date().toISOString();
      setProjects((items) => {
        const activeProject = items.find((item) => item.id === activeProjectId);
        if (!activeProject) return items;
        return [
          { ...activeProject, updatedAt },
          ...items.filter((item) => item.id !== activeProjectId)
        ];
      });
    } catch (error) {
      setMessages((items) => items.filter((item) => !item.id.startsWith("temp_")));
      setNotice({ message: error instanceof Error ? error.message : "Chat failed" });
    } finally {
      setIsBusy(false);
    }
  }

  async function handleUploadFile(file: File) {
    if (!activeProjectId) return;
    try {
      await uploadProjectFile(activeProjectId, file);
      setNotice({ message: "File uploaded and added to agent context.", success: true });
    } catch (error) {
      setNotice({ message: error instanceof Error ? error.message : "Upload failed" });
    }
  }

  return {
    authMode,
    setAuthMode,
    user,
    projects,
    activeProjectId,
    messages,
    notice,
    isBusy,
    isInitializing,
    isLoadingMessages,
    handleAuthSubmit,
    handleLogout,
    handleSelectProject,
    handleCreateProject,
    handleSaveProject,
    handleSendMessage,
    handleUploadFile
  };
}
