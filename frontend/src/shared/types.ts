export type AuthMode = "login" | "register";
export type Role = "user" | "assistant";

export interface User {
  id: string;
  email: string;
  name: string;
}

export interface Project {
  id: string;
  name: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  role: Role;
  content: string;
  createdAt: string;
}

export interface Notice {
  message: string;
  success?: boolean;
}

export interface AuthPayload {
  name?: string;
  email: string;
  password: string;
}

export interface CreateProjectPayload {
  name: string;
  systemPrompt: string;
  files?: File[];
}

export interface SaveProjectPayload {
  id: string;
  name: string;
  systemPrompt: string;
}
