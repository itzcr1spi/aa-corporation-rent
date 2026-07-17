/**
 * Create (or reset the password of) an admin account. There is NO public
 * registration — this is the only way admins are created.
 *
 *   DATABASE_URL=... npm run admin:create -- <email> <password> ["Full Name"]
 * or via env: ADMIN_EMAIL / ADMIN_PASSWORD / ADMIN_NAME
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "../src/lib/db/schema";
import { hashPassword } from "../src/lib/auth/password";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required.");

  const email = (process.argv[2] ?? process.env.ADMIN_EMAIL ?? "").toLowerCase();
  const password = process.argv[3] ?? process.env.ADMIN_PASSWORD ?? "";
  const name = process.argv[4] ?? process.env.ADMIN_NAME ?? "Admin";

  if (!email || !password) {
    throw new Error(
      'Usage: npm run admin:create -- <email> <password> ["Full Name"]',
    );
  }
  if (password.length < 10) {
    throw new Error("Password must be at least 10 characters.");
  }

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });
  const passwordHash = await hashPassword(password);

  await db
    .insert(schema.admins)
    .values({ email, passwordHash, name, role: "superadmin" })
    .onConflictDoUpdate({
      target: schema.admins.email,
      set: { passwordHash, name, active: true, failedAttempts: 0, lockedUntil: null },
    });

  console.log(`✓ Admin ready: ${email}`);
  await client.end();
}

main().catch((err) => {
  console.error(err instanceof Error ? err.message : err);
  process.exit(1);
});
