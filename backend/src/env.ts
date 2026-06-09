import { config } from "dotenv";
import path from "node:path";

// Load backend/.env first, then fall back to the repo root .env for any
// variables not already set.
config({ path: path.resolve(process.cwd(), ".env") });
config({ path: path.resolve(process.cwd(), "..", ".env") });