import { Pool } from "pg";
import { env } from "./env";
import { log } from "./logger";

export const db = new Pool({
  connectionString: env.DATABASE_URL
});

db.on("error", (err) => {
  log.error("Database connection error:", err);
});

export async function query(text: string, params?: any[]) {
  return db.query(text, params);
}

export async function insert(table: string, data: Record<string, any>) {
  const keys = Object.keys(data);
  const values = Object.values(data);
  const placeholders = keys.map((_, i) => `$${i + 1}`).join(", ");

  const sql = `INSERT INTO ${table} (${keys.join(
    ", "
  )}) VALUES (${placeholders}) RETURNING *`;

  return query(sql, values);
}
