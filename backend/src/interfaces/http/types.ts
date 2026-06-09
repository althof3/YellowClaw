import type { Request } from "express";
import type { PublicUser } from "../../domain/types";

export interface AuthedRequest extends Request {
  user?: PublicUser;
}
