import { publicUser, sanitizeProject } from "./serializers";
import { assertEmail } from "./validators";
import { httpError } from "../domain/httpError";
import {
  createSession,
  createUserWithDefaultProject,
  deleteSessionByTokenHash,
  findUserByEmail
} from "../infrastructure/repositories/postgresStore";
import {
  createSessionToken,
  hashPassword,
  hashToken,
  id,
  normalizeEmail,
  nowIso,
  sessionExpiresAt,
  verifyPassword
} from "../infrastructure/auth/session";

export async function registerUser(input: { email: unknown; password: unknown; name?: unknown }) {
  const email = normalizeEmail(input.email);
  const password = String(input.password || "");
  const name = String(input.name || "").trim() || email.split("@")[0];
  assertEmail(email);
  if (password.length < 8) throw httpError(400, "Password must be at least 8 characters");
  if (await findUserByEmail(email)) throw httpError(409, "Email is already registered");

  const sessionToken = createSessionToken();
  const createdAt = nowIso();
  const user = {
    id: id("usr"),
    email,
    name,
    passwordHash: await hashPassword(password),
    createdAt
  };
  const project = {
    id: id("agt"),
    userId: user.id,
    name: "Support Bot",
    systemPrompt: "You are a concise support agent. Ask clarifying questions when needed and answer with practical next steps.",
    createdAt,
    updatedAt: createdAt
  };
  const session = {
    id: id("ses"),
    userId: user.id,
    tokenHash: hashToken(sessionToken),
    createdAt,
    expiresAt: sessionExpiresAt()
  };
  const result = await createUserWithDefaultProject({ user, project, session });

  return {
    sessionToken,
    user: result.user,
    project: sanitizeProject(result.project)
  };
}

export async function loginUser(input: { email: unknown; password: unknown }) {
  const email = normalizeEmail(input.email);
  const password = String(input.password || "");
  const user = await findUserByEmail(email);
  if (!user || !(await verifyPassword(password, user.passwordHash))) {
    throw httpError(401, "Invalid email or password");
  }

  const sessionToken = createSessionToken();
  await createSession({
    id: id("ses"),
    userId: user.id,
    tokenHash: hashToken(sessionToken),
    createdAt: nowIso(),
    expiresAt: sessionExpiresAt()
  });

  return { sessionToken, user: publicUser(user) };
}

export async function logoutUser(token: string): Promise<void> {
  if (token) await deleteSessionByTokenHash(hashToken(token));
}
