"use server";

import { and, eq, sql } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { bookingRequestSchema } from "./schema";
import { getFeeCatalog } from "./repo";
import { computeQuote, rentalDays } from "./pricing";

export type ReserveResult =
  | { ok: true; reference: string }
  | {
      ok: false;
      error: "validation" | "not_found" | "full" | "unavailable" | "server";
      fieldErrors?: Record<string, string>;
    };

/**
 * Create a reservation REQUEST (status = pending; does not block the calendar
 * until an admin confirms it).
 *
 * Security-critical invariants:
 *  - Every field is Zod-validated at the boundary; NO price is accepted from the
 *    client. The total is recomputed here from DB prices and snapshotted.
 *  - A physical unit is allocated in a transaction; the DB EXCLUDE constraint is
 *    the ultimate guard against double-booking at confirmation time.
 */
export async function createReservation(raw: unknown): Promise<ReserveResult> {
  const parsed = bookingRequestSchema.safeParse(raw);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const key = String(issue.path[0] ?? "form");
      if (!fieldErrors[key]) fieldErrors[key] = issue.message;
    }
    return { ok: false, error: "validation", fieldErrors };
  }
  const input = parsed.data;

  if (!process.env.DATABASE_URL) {
    // The flow is complete but nothing can persist without a database.
    return { ok: false, error: "unavailable" };
  }

  const db = getDb();

  try {
    // Resolve model + location server-side (published/active only).
    const [model] = await db
      .select()
      .from(schema.carModels)
      .where(
        and(
          eq(schema.carModels.slug, input.modelSlug),
          eq(schema.carModels.published, true),
        ),
      )
      .limit(1);
    if (!model) return { ok: false, error: "not_found" };

    const [loc] = await db
      .select()
      .from(schema.pickupLocations)
      .where(
        and(
          eq(schema.pickupLocations.slug, input.locationSlug),
          eq(schema.pickupLocations.active, true),
        ),
      )
      .limit(1);
    if (!loc) return { ok: false, error: "not_found" };

    // Authoritative price — never from the client.
    const fees = await getFeeCatalog();
    const days = rentalDays(
      new Date(`${input.startDate}T00:00:00Z`),
      new Date(`${input.endDate}T00:00:00Z`),
    );
    const quote = computeQuote({
      dailyPriceGrosze: model.dailyPriceGrosze,
      depositGrosze: model.depositGrosze,
      days,
      locationFeeGrosze: loc.feeGrosze,
      extras: {
        extraDriver: input.extraDriver,
        childSeat: input.childSeat,
        protectionPackage: input.protectionPackage,
      },
      depositVariant: input.depositVariant,
      fees,
    });

    const reference = `AA-${globalThis.crypto
      .randomUUID()
      .replace(/-/g, "")
      .slice(0, 8)
      .toUpperCase()}`;

    const allocatedCarId = await db.transaction(async (tx) => {
      // Pick an available unit with no BLOCKING reservation overlapping the range.
      const free = await tx.execute(sql`
        SELECT c.id FROM cars c
        WHERE c.model_id = ${model.id} AND c.status = 'available'
        AND NOT EXISTS (
          SELECT 1 FROM reservations r
          WHERE r.car_id = c.id AND r.status IN ('confirmed', 'completed')
          AND daterange(r.start_date, r.end_date, '[]')
              && daterange(${input.startDate}::date, ${input.endDate}::date, '[]')
        )
        ORDER BY c.created_at
        LIMIT 1
        FOR UPDATE OF c SKIP LOCKED
      `);
      const rows = (free as unknown as { rows?: { id: string }[] }).rows ?? [];
      const carId = rows[0]?.id;
      if (!carId) return null;

      await tx.insert(schema.reservations).values({
        reference,
        carModelId: model.id,
        carId,
        startDate: input.startDate,
        endDate: input.endDate,
        days,
        pickupLocationId: loc.id,
        extraDriver: input.extraDriver,
        childSeat: input.childSeat,
        protectionPackage: input.protectionPackage,
        depositVariant: input.depositVariant,
        totalGrosze: quote.totalGrosze,
        depositGrosze: quote.depositGrosze,
        quote: JSON.stringify(quote),
        customerName: input.customerName,
        customerEmail: input.customerEmail,
        customerPhone: input.customerPhone,
        dateOfBirth: input.dateOfBirth,
        addressStreet: input.addressStreet,
        addressPostcode: input.addressPostcode,
        addressCity: input.addressCity,
        licenceNumber: input.licenceNumber,
        status: "pending",
      });
      return carId;
    });

    if (!allocatedCarId) return { ok: false, error: "full" };
    return { ok: true, reference };
  } catch (err) {
    // Generic to the caller; detail stays in server logs (fail closed + quiet).
    console.error("createReservation failed:", err);
    return { ok: false, error: "server" };
  }
}
