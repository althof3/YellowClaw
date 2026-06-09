import type { PoolClient } from "pg";
import type { Message, Project, ProjectFile, PublicUser, Session, User } from "../../domain/types";
import { httpError } from "../../domain/httpError";
import { pool } from "../database/postgres";

function toIso(value: Date | string): string {
  return value instanceof Date ? value.toISOString() : new Date(value).toISOString();
}

function mapUser(row: Record<string, unknown>): User {
  return {
    id: String(row.id),
    email: String(row.email),
    name: String(row.name),
    passwordHash: String(row.password_hash),
    createdAt: toIso(row.created_at as Date | string)
  };
}

function mapProject(row: Record<string, unknown>): Project {
  return {
    id: String(row.id),
    userId: String(row.user_id),
    name: String(row.name),
    systemPrompt: String(row.system_prompt),
    createdAt: toIso(row.created_at as Date | string),
    updatedAt: toIso(row.updated_at as Date | string)
  };
}

function mapMessage(row: Record<string, unknown>): Message {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    role: row.role as Message["role"],
    content: String(row.content),
    createdAt: toIso(row.created_at as Date | string)
  };
}

function mapProjectFile(row: Record<string, unknown>): ProjectFile {
  return {
    id: String(row.id),
    projectId: String(row.project_id),
    providerFileId: row.provider_file_id ? String(row.provider_file_id) : null,
    filename: String(row.filename),
    contentText: String(row.content_text || ""),
    createdAt: toIso(row.created_at as Date | string)
  };
}

async function withClient<T>(runner: (client: PoolClient) => Promise<T>): Promise<T> {
  const client = await pool.connect();
  try {
    return await runner(client);
  } finally {
    client.release();
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const result = await pool.query("SELECT * FROM users WHERE email = $1 LIMIT 1", [email]);
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function findUserBySessionTokenHash(tokenHash: string): Promise<User | null> {
  const result = await pool.query(
    `
      SELECT users.*
      FROM sessions
      JOIN users ON users.id = sessions.user_id
      WHERE sessions.token_hash = $1
        AND sessions.expires_at > NOW()
      LIMIT 1
    `,
    [tokenHash]
  );
  return result.rows[0] ? mapUser(result.rows[0]) : null;
}

export async function createUserWithDefaultProject(params: {
  user: User;
  project: Project;
  session: Session;
}): Promise<{ user: PublicUser; project: Project }> {
  return withClient(async (client) => {
    await client.query("BEGIN");
    try {
      await client.query(
        "INSERT INTO users (id, email, name, password_hash, created_at) VALUES ($1, $2, $3, $4, $5)",
        [params.user.id, params.user.email, params.user.name, params.user.passwordHash, params.user.createdAt]
      );
      await client.query(
        "INSERT INTO projects (id, user_id, name, system_prompt, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6)",
        [
          params.project.id,
          params.project.userId,
          params.project.name,
          params.project.systemPrompt,
          params.project.createdAt,
          params.project.updatedAt
        ]
      );
      await client.query(
        "INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES ($1, $2, $3, $4, $5)",
        [params.session.id, params.session.userId, params.session.tokenHash, params.session.createdAt, params.session.expiresAt]
      );
      await client.query("COMMIT");
      return {
        user: { id: params.user.id, email: params.user.email, name: params.user.name },
        project: params.project
      };
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function createSession(session: Session): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE expires_at <= NOW()");
  await pool.query(
    "INSERT INTO sessions (id, user_id, token_hash, created_at, expires_at) VALUES ($1, $2, $3, $4, $5)",
    [session.id, session.userId, session.tokenHash, session.createdAt, session.expiresAt]
  );
}

export async function deleteSessionByTokenHash(tokenHash: string): Promise<void> {
  await pool.query("DELETE FROM sessions WHERE token_hash = $1", [tokenHash]);
}

export async function listProjectsByUser(userId: string): Promise<Project[]> {
  const result = await pool.query("SELECT * FROM projects WHERE user_id = $1 ORDER BY updated_at DESC", [userId]);
  return result.rows.map(mapProject);
}

export async function createProject(project: Project): Promise<Project> {
  const result = await pool.query(
    "INSERT INTO projects (id, user_id, name, system_prompt, created_at, updated_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [project.id, project.userId, project.name, project.systemPrompt, project.createdAt, project.updatedAt]
  );
  return mapProject(result.rows[0]);
}

export async function findOwnedProject(userId: string, projectId: string): Promise<Project> {
  const result = await pool.query("SELECT * FROM projects WHERE id = $1 AND user_id = $2 LIMIT 1", [projectId, userId]);
  if (!result.rows[0]) throw httpError(404, "Project not found");
  return mapProject(result.rows[0]);
}

export async function updateProject(params: {
  userId: string;
  projectId: string;
  name?: string;
  systemPrompt?: string;
  updatedAt: string;
}): Promise<Project> {
  const current = await findOwnedProject(params.userId, params.projectId);
  const result = await pool.query(
    `
      UPDATE projects
      SET name = $3,
          system_prompt = $4,
          updated_at = $5
      WHERE id = $1 AND user_id = $2
      RETURNING *
    `,
    [
      params.projectId,
      params.userId,
      params.name ?? current.name,
      params.systemPrompt ?? current.systemPrompt,
      params.updatedAt
    ]
  );
  return mapProject(result.rows[0]);
}

export async function listMessages(projectId: string): Promise<Message[]> {
  const result = await pool.query("SELECT * FROM messages WHERE project_id = $1 ORDER BY created_at ASC", [projectId]);
  return result.rows.map(mapMessage);
}

export async function listRecentMessages(projectId: string, limit: number): Promise<Message[]> {
  const result = await pool.query(
    `
      SELECT * FROM (
        SELECT * FROM messages
        WHERE project_id = $1
        ORDER BY created_at DESC
        LIMIT $2
      ) recent_messages
      ORDER BY created_at ASC
    `,
    [projectId, limit]
  );
  return result.rows.map(mapMessage);
}

export async function createChatMessages(params: {
  userId: string;
  projectId: string;
  userMessage: Message;
  assistantMessage: Message;
  updatedAt: string;
}): Promise<{ userMessage: Message; assistantMessage: Message }> {
  return withClient(async (client) => {
    await client.query("BEGIN");
    try {
      const project = await client.query("SELECT id FROM projects WHERE id = $1 AND user_id = $2 LIMIT 1", [
        params.projectId,
        params.userId
      ]);
      if (!project.rowCount) throw httpError(404, "Project not found");
      await client.query(
        "INSERT INTO messages (id, project_id, role, content, created_at) VALUES ($1, $2, $3, $4, $5)",
        [
          params.userMessage.id,
          params.userMessage.projectId,
          params.userMessage.role,
          params.userMessage.content,
          params.userMessage.createdAt
        ]
      );
      await client.query(
        "INSERT INTO messages (id, project_id, role, content, created_at) VALUES ($1, $2, $3, $4, $5)",
        [
          params.assistantMessage.id,
          params.assistantMessage.projectId,
          params.assistantMessage.role,
          params.assistantMessage.content,
          params.assistantMessage.createdAt
        ]
      );
      await client.query("UPDATE projects SET updated_at = $3 WHERE id = $1 AND user_id = $2", [
        params.projectId,
        params.userId,
        params.updatedAt
      ]);
      await client.query("COMMIT");
      return params;
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    }
  });
}

export async function createProjectFile(file: ProjectFile, userId: string): Promise<ProjectFile> {
  await findOwnedProject(userId, file.projectId);
  const result = await pool.query(
    "INSERT INTO files (id, project_id, provider_file_id, filename, content_text, created_at) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *",
    [file.id, file.projectId, file.providerFileId, file.filename, file.contentText, file.createdAt]
  );
  return mapProjectFile(result.rows[0]);
}

export async function listProjectFiles(projectId: string): Promise<ProjectFile[]> {
  const result = await pool.query("SELECT * FROM files WHERE project_id = $1 ORDER BY created_at ASC", [projectId]);
  return result.rows.map(mapProjectFile);
}
