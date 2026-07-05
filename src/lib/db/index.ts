import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";

/**
 * Thin DB access layer. Business code imports `getDb()` — never the postgres
 * client or a provider SDK directly — so the database is swappable (Neon/Supabase
 * now, self-hosted Postgres on Hetzner later) without touching feature code.
 */

const connectionString = process.env.DATABASE_URL;

// Reuse the connection across dev HMR reloads to avoid exhausting Postgres.
const globalForDb = globalThis as unknown as {
  _pgClient?: ReturnType<typeof postgres>;
};

function getClient() {
  if (!connectionString) return undefined;
  if (!globalForDb._pgClient) {
    globalForDb._pgClient = postgres(connectionString, { max: 10 });
  }
  return globalForDb._pgClient;
}

export type Database = ReturnType<typeof drizzle<typeof schema>>;

export function getDb(): Database {
  const client = getClient();
  if (!client) {
    throw new Error(
      "DATABASE_URL is not set. Database-backed features are unavailable — " +
        "copy .env.example to .env and point DATABASE_URL at Postgres.",
    );
  }
  return drizzle(client, { schema });
}

export { schema };
