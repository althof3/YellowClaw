export type Role = "user" | "assistant";

export interface User {
  id: string;
  email: string;
  name: string;
  passwordHash: string;
  createdAt: string;
}

export interface PublicUser {
  id: string;
  email: string;
  name: string;
}

export interface Session {
  id: string;
  userId: string;
  tokenHash: string;
  createdAt: string;
  expiresAt: string;
}

export interface Project {
  id: string;
  userId: string;
  name: string;
  systemPrompt: string;
  createdAt: string;
  updatedAt: string;
}

export interface Message {
  id: string;
  projectId: string;
  role: Role;
  content: string;
  createdAt: string;
}

export interface ProjectFile {
  id: string;
  projectId: string;
  providerFileId: string | null;
  filename: string;
  contentText: string;
  createdAt: string;
}
