import "./env";
import { readdir, readFile } from "node:fs/promises";
import path from "node:path";
import { pool } from "./infrastructure/database/postgres";

function resolveMigrationsDir(): string {
  const fromWorkspaceRoot = path.resolve(process.cwd(), "backend", "migrations");
  const fromBackendRoot = path.resolve(process.cwd(), "migrations");
  return process.cwd().endsWith(`${path.sep}backend`) ? fromBackendRoot : fromWorkspaceRoot;
}

export async function runMigrations(): Promise<void> {
  await pool.query(`
    CREATE TABLE IF NOT EXISTS _schema_migrations (
      id TEXT PRIMARY KEY,
      applied_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    )
  `);

  const migrationsDir = resolveMigrationsDir();
  const files = (await readdir(migrationsDir))
    .filter((entry) => entry.endsWith(".sql"))
    .sort((left, right) => left.localeCompare(right));

  for (const file of files) {
    const alreadyApplied = await pool.query("SELECT 1 FROM _schema_migrations WHERE id = $1 LIMIT 1", [file]);
    if (alreadyApplied.rowCount) continue;

    const sql = await readFile(path.join(migrationsDir, file), "utf8");
    const client = await pool.connect();
    try {
      await client.query("BEGIN");
      await client.query(sql);
      await client.query("INSERT INTO _schema_migrations (id) VALUES ($1)", [file]);
      await client.query("COMMIT");
      console.log(`Applied migration ${file}`);
    } catch (error) {
      await client.query("ROLLBACK");
      throw error;
    } finally {
      client.release();
    }
  }
}

if (require.main === module) {
  runMigrations()
    .then(async () => {
      await pool.end();
    })
    .catch(async (error) => {
      console.error(error);
      await pool.end();
      process.exit(1);
    });
}
