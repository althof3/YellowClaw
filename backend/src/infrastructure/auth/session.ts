import { createHash, createHmac, randomBytes, scrypt as scryptCallback, timingSafeEqual } from "node:crypto";
import { promisify } from "node:util";
import type { Request, Response } from "express";
import { publicUser } from "../../application/serializers";
import type { PublicUser } from "../../domain/types";
import { findUserBySessionTokenHash } from "../repositories/postgresStore";

const scrypt = promisify(scryptCallback);
const sessionSecret = process.env.SESSION_SECRET || "yellowclaw-dev-secret-change-me";
const sessionCookieName = "yc_session";
const sessionMaxAgeMs = 7 * 24 * 60 * 60 * 1000;

export function id(prefix: string): string {
  return `${prefix}_${randomBytes(12).toString("hex")}`;
}

export function nowIso(): string {
  return new Date().toISOString();
}

export function normalizeEmail(email: unknown): string {
  return String(email || "").trim().toLowerCase();
}

export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString("hex");
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  return `${salt}:${hash.toString("hex")}`;
}

export async function verifyPassword(password: string, storedHash: string): Promise<boolean> {
  const [salt, key] = String(storedHash || "").split(":");
  if (!salt || !key) return false;
  const hash = (await scrypt(password, salt, 64)) as Buffer;
  const stored = Buffer.from(key, "hex");
  return stored.length === hash.length && timingSafeEqual(stored, hash);
}

export function hashToken(token: string): string {
  return createHash("sha256").update(token).digest("hex");
}

export function createSessionToken(): string {
  return randomBytes(32).toString("hex");
}

export function sessionExpiresAt(): string {
  return new Date(Date.now() + sessionMaxAgeMs).toISOString();
}

function sign(value: string): string {
  return createHmac("sha256", sessionSecret).update(value).digest("hex");
}

export function parseSignedToken(req: Request): string {
  const cookie = String(req.cookies?.[sessionCookieName] || "");
  const [token, signature] = cookie.split(".");
  if (!token || !signature) return "";
  const expected = sign(token);
  const a = Buffer.from(signature);
  const b = Buffer.from(expected);
  if (a.length !== b.length || !timingSafeEqual(a, b)) return "";
  return token;
}

export function setSessionCookie(res: Response, token: string): void {
  res.cookie(sessionCookieName, `${token}.${sign(token)}`, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    maxAge: sessionMaxAgeMs,
    path: "/"
  });
}

export function clearSessionCookie(res: Response): void {
  res.clearCookie(sessionCookieName, { httpOnly: true, sameSite: "lax", path: "/" });
}

export async function currentUser(req: Request): Promise<PublicUser | null> {
  const token = parseSignedToken(req);
  if (!token) return null;
  const tokenHash = hashToken(token);
  const user = await findUserBySessionTokenHash(tokenHash);
  return user ? publicUser(user) : null;
}
