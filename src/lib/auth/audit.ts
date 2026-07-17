import "server-only";
import { headers } from "next/headers";
import { getDb, schema } from "@/lib/db";

/** Best-effort client IP from proxy headers (never trusted for authz, only logging). */
export async function clientIp(): Promise<string | null> {
  const h = await headers();
  const fwd = h.get("x-forwarded-for");
  return (fwd?.split(",")[0] ?? h.get("x-real-ip") ?? null)?.slice(0, 64) ?? null;
}

/** Append an admin action to the immutable audit trail. */
export async function recordAudit(entry: {
  adminId: string | null;
  action: string;
  entity?: string;
  entityId?: string;
  before?: unknown;
  after?: unknown;
}): Promise<void> {
  const db = getDb();
  await db.insert(schema.auditLog).values({
    adminId: entry.adminId,
    action: entry.action,
    entity: entry.entity ?? null,
    entityId: entry.entityId ?? null,
    before: entry.before ?? null,
    after: entry.after ?? null,
    ip: await clientIp(),
  });
}
