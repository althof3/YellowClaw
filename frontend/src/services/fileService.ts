import { api } from "./http";

export async function uploadProjectFile(projectId: string, file: File) {
  const content = await file.text();
  return api(`/api/projects/${projectId}/files`, {
    method: "POST",
    body: JSON.stringify({ filename: file.name, content })
  });
}
