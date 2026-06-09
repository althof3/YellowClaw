import { httpError } from "../domain/httpError";

export function assertText(value: unknown, field: string, max = 10000): string {
  const text = String(value || "").trim();
  if (!text) throw httpError(400, `${field} is required`);
  if (text.length > max) throw httpError(400, `${field} is too long`);
  return text;
}

export function assertEmail(email: string): void {
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
    throw httpError(400, "Valid email is required");
  }
}
