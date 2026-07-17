import "server-only";
import { and, count, desc, eq, like } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

const PAGE_SIZE = 40;

/** Action prefixes (the part before the first dot) used to group/filter the log. */
export const AUDIT_CATEGORIES = [
  "login",
  "reservation",
  "fleet",
  "pricing",
  "admin",
] as const;
export type AuditCategory = (typeof AUDIT_CATEGORIES)[number];

export function isAuditCategory(v: unknown): v is AuditCategory {
  return (
    typeof v === "string" && (AUDIT_CATEGORIES as readonly string[]).includes(v)
  );
}

export async function listAudit(filters: {
  category?: AuditCategory;
  page?: number;
}) {
  const db = getDb();
  const page = Math.max(1, filters.page ?? 1);

  // `category` is whitelisted by the caller, so this LIKE pattern is safe.
  const where = and(
    filters.category
      ? like(schema.auditLog.action, `${filters.category}.%`)
      : undefined,
  );

  const [items, [{ total }]] = await Promise.all([
    db
      .select({
        id: schema.auditLog.id,
        action: schema.auditLog.action,
        entity: schema.auditLog.entity,
        entityId: schema.auditLog.entityId,
        before: schema.auditLog.before,
        after: schema.auditLog.after,
        ip: schema.auditLog.ip,
        createdAt: schema.auditLog.createdAt,
        adminName: schema.admins.name,
        adminEmail: schema.admins.email,
      })
      .from(schema.auditLog)
      .leftJoin(schema.admins, eq(schema.auditLog.adminId, schema.admins.id))
      .where(where)
      .orderBy(desc(schema.auditLog.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(schema.auditLog).where(where),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE };
}

export type AuditEntry = Awaited<ReturnType<typeof listAudit>>["items"][number];
