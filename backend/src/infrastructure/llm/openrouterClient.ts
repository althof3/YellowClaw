import type { Message } from "../../domain/types";
import { httpError } from "../../domain/httpError";

interface OpenRouterResponse {
  choices?: Array<{
    message?: {
      content?:
        | string
        | Array<{
            type?: string;
            text?: string;
          }>;
    };
  }>;
  error?: {
    message?: string;
  };
}

function readAssistantText(payload: OpenRouterResponse): string {
  const content = payload.choices?.[0]?.message?.content;
  if (typeof content === "string" && content.trim()) return content;
  if (Array.isArray(content)) {
    const text = content
      .filter((item) => item.type === "text" && item.text)
      .map((item) => item.text!.trim())
      .filter(Boolean)
      .join("\n");
    if (text) return text;
  }
  return "I could not produce a response.";
}

export async function createChatResponse(params: {
  apiKey: string;
  model: string;
  instructions: string;
  messages: Array<Pick<Message, "role" | "content">>;
}): Promise<string> {
  if (!params.apiKey) throw httpError(503, "OPENROUTER_API_KEY is not configured");

  const headers: Record<string, string> = {
    Authorization: `Bearer ${params.apiKey}`,
    "Content-Type": "application/json"
  };

  const response = await fetch("https://openrouter.ai/api/v1/chat/completions", {
    method: "POST",
    headers,
    body: JSON.stringify({
      model: params.model,
      max_tokens: 1024,
      messages: [{ role: "system", content: params.instructions }, ...params.messages]
    })
  });

  const payload = (await response.json().catch(() => ({}))) as OpenRouterResponse;
  if (!response.ok) throw httpError(response.status, payload.error?.message || "OpenRouter request failed");

  return readAssistantText(payload);
}
