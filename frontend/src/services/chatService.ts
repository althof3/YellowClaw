import { api } from "./http";
import type { Message } from "../shared/types";

export function sendMessage(projectId: string, message: string) {
  return api<{ messages: Message[] }>(`/api/projects/${projectId}/chat`, {
    method: "POST",
    body: JSON.stringify({ message })
  });
}
