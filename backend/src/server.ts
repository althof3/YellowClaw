import "./env";
import cookieParser from "cookie-parser";
import cors from "cors";
import express, { type NextFunction, type Request, type Response } from "express";
import path from "node:path";
import apiRouter from "./interfaces/http/routes";
import { HttpError } from "./domain/httpError";
import { pool } from "./infrastructure/database/postgres";

const app = express();
const port = Number(process.env.PORT || 4000);

const allowedOrigins = (process.env.CORS_ORIGIN || "http://localhost:3000")
  .split(",")
  .map((origin) => origin.trim())
  .filter(Boolean);

app.use(
  cors({
    origin: allowedOrigins,
    credentials: true,
  })
);

app.use(express.json({ limit: "2mb" }));
app.use(cookieParser());
app.use("/api", apiRouter);

if (process.env.NODE_ENV === "production") {
  const buildDir = path.resolve(process.cwd(), "..", "frontend", "build");
  app.use(express.static(buildDir));
  app.get("*", (_req, res) => {
    res.sendFile(path.join(buildDir, "index.html"));
  });
}

app.use((error: unknown, _req: Request, res: Response, _next: NextFunction) => {
  const status = error instanceof HttpError ? error.status : 500;
  const message = error instanceof Error ? error.message : "Something went wrong";
  const publicMessage = status === 503 || status < 500 ? message : "Something went wrong";
  if (status >= 500) console.error(error);
  res.status(status).json({ error: publicMessage });
});

async function start(): Promise<void> {
  try {
    await pool.query("SELECT 1");
    console.log("Database connection OK");
  } catch (error) {
    console.error("Database ping failed, server will not start:", error);
    process.exit(1);
  }

  app.listen(port, () => {
    console.log(`YellowClaw API running at http://localhost:${port}`);
  });
}

start();
