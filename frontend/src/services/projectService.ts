import { api } from "./http";
import type { CreateProjectPayload, Message, Project, SaveProjectPayload } from "../shared/types";

export function listProjects() {
  return api<{ projects: Project[] }>("/api/projects");
}

export function createProject(payload: CreateProjectPayload) {
  return api<{ project: Project }>("/api/projects", {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function updateProject(payload: SaveProjectPayload) {
  return api<{ project: Project }>(`/api/projects/${payload.id}`, {
    method: "PATCH",
    body: JSON.stringify({ name: payload.name, systemPrompt: payload.systemPrompt })
  });
}

export function listMessages(projectId: string) {
  return api<{ messages: Message[] }>(`/api/projects/${projectId}/messages`);
}
