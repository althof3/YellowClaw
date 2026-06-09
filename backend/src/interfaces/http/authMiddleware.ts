import type { NextFunction, Response } from "express";
import { httpError } from "../../domain/httpError";
import { currentUser } from "../../infrastructure/auth/session";
import type { AuthedRequest } from "./types";

export async function requireUser(req: AuthedRequest, _res: Response, next: NextFunction) {
  try {
    const user = await currentUser(req);
    if (!user) throw httpError(401, "Authentication required");
    req.user = user;
    next();
  } catch (error) {
    next(error);
  }
}
