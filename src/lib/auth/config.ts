import NextAuth from "next-auth";
import Credentials from "next-auth/providers/credentials";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { verifyPassword } from "./password";

const LOCK_THRESHOLD = 5; // failed attempts before lockout
const LOCK_MINUTES = 15;

const credsSchema = z.object({
  email: z.string().email().max(200),
  password: z.string().min(1).max(200),
});

export const { handlers, auth, signIn, signOut } = NextAuth({
  trustHost: true,
  session: { strategy: "jwt", maxAge: 60 * 60 * 8 }, // 8h
  pages: { signIn: "/admin/login" },
  providers: [
    Credentials({
      credentials: { email: {}, password: {}, ip: {} },
      async authorize(raw) {
        const parsed = credsSchema.safeParse(raw);
        if (!parsed.success) return null;
        const email = parsed.data.email.toLowerCase();
        const password = parsed.data.password;
        const ip = typeof raw?.ip === "string" ? raw.ip.slice(0, 64) : null;

        const db = getDb();
        const [admin] = await db
          .select()
          .from(schema.admins)
          .where(eq(schema.admins.email, email))
          .limit(1);

        const now = new Date();
        const fail = async () => {
          await db
            .insert(schema.auditLog)
            .values({ adminId: admin?.id ?? null, action: "login.fail", ip });
          return null;
        };

        // Generic failure everywhere below (no user enumeration).
        if (!admin || !admin.active) return fail();
        if (admin.lockedUntil && admin.lockedUntil > now) return fail();

        const ok = await verifyPassword(admin.passwordHash, password);
        if (!ok) {
          const attempts = admin.failedAttempts + 1;
          const lock = attempts >= LOCK_THRESHOLD;
          await db
            .update(schema.admins)
            .set({
              failedAttempts: attempts,
              lockedUntil: lock
                ? new Date(now.getTime() + LOCK_MINUTES * 60_000)
                : admin.lockedUntil,
            })
            .where(eq(schema.admins.id, admin.id));
          return fail();
        }

        // Success — reset counters, stamp login, audit.
        await db
          .update(schema.admins)
          .set({ failedAttempts: 0, lockedUntil: null, lastLoginAt: now })
          .where(eq(schema.admins.id, admin.id));
        await db
          .insert(schema.auditLog)
          .values({ adminId: admin.id, action: "login.success", ip });

        return {
          id: admin.id,
          email: admin.email,
          name: admin.name,
          role: admin.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (session.user) {
        session.user.id = typeof token.id === "string" ? token.id : "";
        session.user.role =
          token.role === "superadmin" ? "superadmin" : "admin";
      }
      return session;
    },
    authorized({ auth }) {
      return Boolean(auth?.user);
    },
  },
});
