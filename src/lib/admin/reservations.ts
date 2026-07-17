import "server-only";
import { and, count, desc, eq, gte, ilike, inArray, lte, or } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { QuoteBreakdown } from "@/lib/booking/types";
import type { ReservationStatus } from "./reservation-status";

const PAGE_SIZE = 20;

export type ReservationFilters = {
  status?: ReservationStatus;
  q?: string;
  from?: string; // ISO date
  to?: string; // ISO date
  page?: number;
};

export async function listReservations(filters: ReservationFilters) {
  const db = getDb();
  const page = Math.max(1, filters.page ?? 1);

  const where = and(
    filters.status ? eq(schema.reservations.status, filters.status) : undefined,
    filters.from ? gte(schema.reservations.startDate, filters.from) : undefined,
    filters.to ? lte(schema.reservations.startDate, filters.to) : undefined,
    filters.q
      ? or(
          ilike(schema.reservations.reference, `%${filters.q}%`),
          ilike(schema.reservations.customerName, `%${filters.q}%`),
          ilike(schema.reservations.customerEmail, `%${filters.q}%`),
        )
      : undefined,
  );

  const [items, [{ total }]] = await Promise.all([
    db
      .select({
        id: schema.reservations.id,
        reference: schema.reservations.reference,
        status: schema.reservations.status,
        startDate: schema.reservations.startDate,
        endDate: schema.reservations.endDate,
        totalGrosze: schema.reservations.totalGrosze,
        customerName: schema.reservations.customerName,
        createdAt: schema.reservations.createdAt,
        brand: schema.carModels.brand,
        model: schema.carModels.model,
        plate: schema.cars.plate,
      })
      .from(schema.reservations)
      .leftJoin(schema.carModels, eq(schema.reservations.carModelId, schema.carModels.id))
      .leftJoin(schema.cars, eq(schema.reservations.carId, schema.cars.id))
      .where(where)
      .orderBy(desc(schema.reservations.createdAt))
      .limit(PAGE_SIZE)
      .offset((page - 1) * PAGE_SIZE),
    db.select({ total: count() }).from(schema.reservations).where(where),
  ]);

  return { items, total, page, pageSize: PAGE_SIZE };
}

export async function getReservation(id: string) {
  const db = getDb();
  const [row] = await db
    .select({
      r: schema.reservations,
      brand: schema.carModels.brand,
      model: schema.carModels.model,
      plate: schema.cars.plate,
      vin: schema.cars.vin,
      locationName: schema.pickupLocations.name,
    })
    .from(schema.reservations)
    .leftJoin(schema.carModels, eq(schema.reservations.carModelId, schema.carModels.id))
    .leftJoin(schema.cars, eq(schema.reservations.carId, schema.cars.id))
    .leftJoin(
      schema.pickupLocations,
      eq(schema.reservations.pickupLocationId, schema.pickupLocations.id),
    )
    .where(eq(schema.reservations.id, id))
    .limit(1);

  if (!row) return null;
  let quote: QuoteBreakdown | null = null;
  try {
    quote = JSON.parse(row.r.quote) as QuoteBreakdown;
  } catch {
    quote = null;
  }
  return { ...row, quote };
}

export async function getDashboardStats() {
  const db = getDb();
  const [byStatus, [svc]] = await Promise.all([
    db
      .select({ status: schema.reservations.status, n: count() })
      .from(schema.reservations)
      .groupBy(schema.reservations.status),
    db
      .select({ n: count() })
      .from(schema.cars)
      .where(inArray(schema.cars.status, ["service", "damaged"])),
  ]);
  const map = Object.fromEntries(byStatus.map((r) => [r.status, r.n]));
  const total = byStatus.reduce((s, r) => s + r.n, 0);
  return {
    total,
    pending: map.pending ?? 0,
    confirmed: map.confirmed ?? 0,
    carsInService: svc?.n ?? 0,
  };
}

/** Postgres raises this SQLSTATE (exclusion_violation) when confirming would overlap. */
export const EXCLUSION_VIOLATION = "23P01";

export function isOverlapError(err: unknown): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === EXCLUSION_VIOLATION
  );
}
