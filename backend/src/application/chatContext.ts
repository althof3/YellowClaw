import type { ProjectFile } from "../domain/types";

const MAX_FILE_SNIPPET_CHARS = 12_000;
const MAX_TOTAL_FILE_CHARS = 24_000;

function trimFileContent(content: string, remaining: number): string {
  const normalized = content.trim();
  if (!normalized || remaining <= 0) return "";
  if (normalized.length <= remaining) return normalized;
  return `${normalized.slice(0, Math.max(0, remaining - 18)).trimEnd()}\n...[truncated]`;
}

export function buildProjectInstructions(systemPrompt: string, files: ProjectFile[]): string {
  const basePrompt = systemPrompt.trim() || "You are a helpful assistant.";
  const usableFiles = files
    .map((file) => ({ ...file, contentText: file.contentText.trim() }))
    .filter((file) => file.contentText.length > 0);

  if (!usableFiles.length) return basePrompt;

  let remaining = MAX_TOTAL_FILE_CHARS;
  const fileSections: string[] = [];

  for (const file of usableFiles) {
    const snippet = trimFileContent(file.contentText.slice(0, MAX_FILE_SNIPPET_CHARS), remaining);
    if (!snippet) continue;
    fileSections.push(`[${file.filename}]\n${snippet}`);
    remaining -= snippet.length;
    if (remaining <= 0) break;
  }

  if (!fileSections.length) return basePrompt;

  return `${basePrompt}\n\nAttached knowledge files:\n${fileSections.join("\n\n")}`;
}
