"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { recordAudit } from "@/lib/auth/audit";
import { canTransition, type ReservationStatus } from "@/lib/admin/reservation-status";
import { isOverlapError } from "@/lib/admin/reservations";

const input = z.object({
  id: z.string().uuid(),
  to: z.enum(["confirmed", "rejected", "cancelled", "completed"]),
});

export type StatusResult =
  | { ok: true }
  | { ok: false; error: "invalid" | "not_found" | "illegal" | "overlap" | "server" };

export async function updateReservationStatus(
  raw: unknown,
): Promise<StatusResult> {
  const admin = await requireAdmin(); // authoritative — actions are their own endpoint
  const parsed = input.safeParse(raw);
  if (!parsed.success) return { ok: false, error: "invalid" };
  const { id, to } = parsed.data;

  const db = getDb();
  try {
    const [current] = await db
      .select({ status: schema.reservations.status })
      .from(schema.reservations)
      .where(eq(schema.reservations.id, id))
      .limit(1);
    if (!current) return { ok: false, error: "not_found" };

    if (!canTransition(current.status as ReservationStatus, to)) {
      return { ok: false, error: "illegal" };
    }

    // Confirming a reservation is what BLOCKS the calendar: the DB EXCLUDE
    // constraint rejects the UPDATE if it would overlap another confirmed
    // booking for the same car unit. That's the enforcement point.
    await db
      .update(schema.reservations)
      .set({ status: to, updatedAt: new Date() })
      .where(eq(schema.reservations.id, id));

    await recordAudit({
      adminId: admin.id,
      action: `reservation.${to}`,
      entity: "reservation",
      entityId: id,
      before: { status: current.status },
      after: { status: to },
    });

    revalidatePath("/admin/reservations");
    revalidatePath(`/admin/reservations/${id}`);
    return { ok: true };
  } catch (err) {
    if (isOverlapError(err)) return { ok: false, error: "overlap" };
    console.error("updateReservationStatus failed:", err);
    return { ok: false, error: "server" };
  }
}
