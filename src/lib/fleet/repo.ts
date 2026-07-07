import "server-only";
import { and, asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import type { CarModel } from "@/lib/db/schema";
import { FLEET, type FleetModelSeed } from "./data";
import type { FleetCar } from "./types";

// A slug must match this exact shape before it ever reaches a query (fail closed).
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

function fromSeed(m: FleetModelSeed): FleetCar {
  return {
    slug: m.slug,
    brand: m.brand,
    model: m.model,
    year: m.year,
    category: m.category,
    seats: m.seats,
    gearbox: m.gearbox,
    fuel: m.fuel,
    kmPerDayLimit: m.kmPerDayLimit,
    dailyPriceGrosze: m.dailyPriceGrosze,
    monthlyPriceGrosze: m.monthlyPriceGrosze,
    depositGrosze: m.depositGrosze,
    descriptionPl: m.descriptionPl,
    descriptionEn: m.descriptionEn,
    images: m.images,
    unitCount: m.units.length,
    availableCount: m.units.filter((u) => u.status === "available").length,
  };
}

function fromRow(m: CarModel, units: { status: string }[]): FleetCar {
  return {
    slug: m.slug,
    brand: m.brand,
    model: m.model,
    year: m.year,
    category: m.category,
    seats: m.seats,
    gearbox: m.gearbox,
    fuel: m.fuel,
    kmPerDayLimit: m.kmPerDayLimit,
    dailyPriceGrosze: m.dailyPriceGrosze,
    monthlyPriceGrosze: m.monthlyPriceGrosze,
    depositGrosze: m.depositGrosze,
    descriptionPl: m.descriptionPl,
    descriptionEn: m.descriptionEn,
    images: m.images,
    unitCount: units.length,
    availableCount: units.filter((u) => u.status === "available").length,
  };
}

const usingDb = () => Boolean(process.env.DATABASE_URL);

/** Published fleet, sorted for display. */
export async function getFleet(): Promise<FleetCar[]> {
  if (!usingDb()) {
    return [...FLEET].sort((a, b) => a.sortOrder - b.sortOrder).map(fromSeed);
  }

  const db = getDb();
  const models = await db
    .select()
    .from(schema.carModels)
    .where(eq(schema.carModels.published, true))
    .orderBy(asc(schema.carModels.sortOrder));
  const units = await db
    .select({ modelId: schema.cars.modelId, status: schema.cars.status })
    .from(schema.cars);

  return models.map((m) =>
    fromRow(
      m,
      units.filter((u) => u.modelId === m.id),
    ),
  );
}

/** A single published listing by slug, or null (unknown/unpublished/invalid slug). */
export async function getCarModelBySlug(slug: string): Promise<FleetCar | null> {
  if (!SLUG_RE.test(slug) || slug.length > 64) return null;

  if (!usingDb()) {
    const m = FLEET.find((x) => x.slug === slug);
    return m ? fromSeed(m) : null;
  }

  const db = getDb();
  const [m] = await db
    .select()
    .from(schema.carModels)
    .where(
      and(eq(schema.carModels.slug, slug), eq(schema.carModels.published, true)),
    )
    .limit(1);
  if (!m) return null;

  const units = await db
    .select({ status: schema.cars.status })
    .from(schema.cars)
    .where(eq(schema.cars.modelId, m.id));
  return fromRow(m, units);
}

/** Slugs for generateStaticParams / sitemap. */
export async function getFleetSlugs(): Promise<string[]> {
  const fleet = await getFleet();
  return fleet.map((c) => c.slug);
}
