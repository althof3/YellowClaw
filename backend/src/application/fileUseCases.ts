import { assertText } from "./validators";
import { createProjectFile, findOwnedProject } from "../infrastructure/repositories/postgresStore";
import { id, nowIso } from "../infrastructure/auth/session";

export async function uploadProjectFile(
  userId: string,
  projectId: string,
  input: { filename: unknown; content: unknown }
) {
  const filename = assertText(input.filename, "Filename", 180).replace(/[^\w.\- ]/g, "_");
  const content = assertText(input.content, "File content", 120_000);
  await findOwnedProject(userId, projectId);

  return createProjectFile(
    {
      id: id("file"),
      projectId,
      providerFileId: null,
      filename,
      contentText: content,
      createdAt: nowIso()
    },
    userId
  );
}
