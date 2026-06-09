import { sanitizeProject } from "./serializers";
import { assertText } from "./validators";
import {
  createProject,
  findOwnedProject,
  listMessages,
  listProjectsByUser,
  updateProject
} from "../infrastructure/repositories/postgresStore";
import { id, nowIso } from "../infrastructure/auth/session";

export async function listUserProjects(userId: string) {
  return (await listProjectsByUser(userId)).map(sanitizeProject);
}

export async function createUserProject(userId: string, input: { name: unknown; systemPrompt?: unknown }) {
  const name = assertText(input.name, "Project name", 80);
  const systemPrompt = String(input.systemPrompt || "You are a helpful assistant.").trim().slice(0, 10000);
  const createdAt = nowIso();
  const project = await createProject({
    id: id("agt"),
    userId,
    name,
    systemPrompt,
    createdAt,
    updatedAt: createdAt
  });
  return sanitizeProject(project);
}

export async function updateUserProject(
  userId: string,
  projectId: string,
  input: { name?: unknown; systemPrompt?: unknown }
) {
  const project = await updateProject({
    userId,
    projectId,
    name: input.name !== undefined ? assertText(input.name, "Project name", 80) : undefined,
    systemPrompt: input.systemPrompt !== undefined ? assertText(input.systemPrompt, "System prompt", 10000) : undefined,
    updatedAt: nowIso()
  });
  return sanitizeProject(project);
}

export async function listProjectMessages(userId: string, projectId: string) {
  await findOwnedProject(userId, projectId);
  return (await listMessages(projectId)).map(({ id: messageId, role, content, createdAt }) => ({
    id: messageId,
    role,
    content,
    createdAt
  }));
}
