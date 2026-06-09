import { api } from "./http";
import type { AuthMode, AuthPayload, Project, User } from "../shared/types";

export function getCurrentUser() {
  return api<{ user: User | null }>("/api/me");
}

export function authenticate(mode: AuthMode, payload: AuthPayload) {
  return api<{ user: User; project?: Project }>(`/api/${mode}`, {
    method: "POST",
    body: JSON.stringify(payload)
  });
}

export function logout() {
  return api<{ ok: boolean }>("/api/logout", { method: "POST" });
}
