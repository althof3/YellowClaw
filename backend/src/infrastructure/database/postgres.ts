import { Pool } from "pg";

const databaseUrl = process.env.DATABASE_URL || "postgresql://yellowclaw:yellowclaw@localhost:5432/yellowclaw";

export const pool = new Pool({
  connectionString: databaseUrl
});

export async function closeDb(): Promise<void> {
  await pool.end();
}
