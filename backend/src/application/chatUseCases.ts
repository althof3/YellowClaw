import { assertText } from "./validators";
import type { Message } from "../domain/types";
import {
  createChatMessages,
  findOwnedProject,
  listProjectFiles,
  listRecentMessages
} from "../infrastructure/repositories/postgresStore";
import { id, nowIso } from "../infrastructure/auth/session";
import { createChatResponse } from "../infrastructure/llm/openrouterClient";
import { buildProjectInstructions } from "./chatContext";

const openrouterModel = process.env.OPENROUTER_MODEL || "openai/gpt-4.1-mini";
const openrouterApiKey = process.env.OPENROUTER_API_KEY || "";

export async function sendProjectMessage(userId: string, projectId: string, input: { message: unknown }) {
  const content = assertText(input.message, "Message", 4000);
  const project = await findOwnedProject(userId, projectId);
  const priorMessages = await listRecentMessages(project.id, 12);
  const files = await listProjectFiles(project.id);

  const assistantText = await createChatResponse({
    apiKey: openrouterApiKey,
    model: openrouterModel,
    instructions: buildProjectInstructions(project.systemPrompt, files),
    messages: [...priorMessages.map(({ role, content: text }) => ({ role, content: text })), { role: "user", content }],
  });

  const updatedAt = nowIso();
  const userMessage: Message = { id: id("msg"), projectId: project.id, role: "user", content, createdAt: updatedAt };
  const assistantMessage: Message = {
    id: id("msg"),
    projectId: project.id,
    role: "assistant",
    content: assistantText,
    createdAt: updatedAt
  };
  const saved = await createChatMessages({
    userId,
    projectId: project.id,
    userMessage,
    assistantMessage,
    updatedAt
  });

  return [
    {
      id: saved.userMessage.id,
      role: saved.userMessage.role,
      content: saved.userMessage.content,
      createdAt: saved.userMessage.createdAt
    },
    {
      id: saved.assistantMessage.id,
      role: saved.assistantMessage.role,
      content: saved.assistantMessage.content,
      createdAt: saved.assistantMessage.createdAt
    }
  ];
}
