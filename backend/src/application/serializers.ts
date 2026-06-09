import type { Project, User } from "../domain/types";

export function publicUser(user: User) {
  return { id: user.id, email: user.email, name: user.name };
}

export function sanitizeProject(project: Project) {
  return {
    id: project.id,
    name: project.name,
    systemPrompt: project.systemPrompt,
    createdAt: project.createdAt,
    updatedAt: project.updatedAt
  };
}
