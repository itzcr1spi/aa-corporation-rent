import "server-only";
import { asc } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/** Everything the Cennik (pricing) screen edits, in one round-trip. */
export async function listPricing() {
  const db = getDb();
  const [models, fees, locations] = await Promise.all([
    db
      .select({
        id: schema.carModels.id,
        brand: schema.carModels.brand,
        model: schema.carModels.model,
        year: schema.carModels.year,
        dailyPriceGrosze: schema.carModels.dailyPriceGrosze,
        monthlyPriceGrosze: schema.carModels.monthlyPriceGrosze,
        depositGrosze: schema.carModels.depositGrosze,
        kmPerDayLimit: schema.carModels.kmPerDayLimit,
        published: schema.carModels.published,
      })
      .from(schema.carModels)
      .orderBy(asc(schema.carModels.sortOrder), asc(schema.carModels.brand)),
    db
      .select({
        id: schema.fees.id,
        code: schema.fees.code,
        amountGrosze: schema.fees.amountGrosze,
        unit: schema.fees.unit,
        active: schema.fees.active,
      })
      .from(schema.fees)
      .orderBy(asc(schema.fees.code)),
    db
      .select({
        id: schema.pickupLocations.id,
        slug: schema.pickupLocations.slug,
        name: schema.pickupLocations.name,
        feeGrosze: schema.pickupLocations.feeGrosze,
        active: schema.pickupLocations.active,
      })
      .from(schema.pickupLocations)
      .orderBy(asc(schema.pickupLocations.sortOrder)),
  ]);
  return { models, fees, locations };
}

export type PricingModel = Awaited<
  ReturnType<typeof listPricing>
>["models"][number];
export type PricingFee = Awaited<
  ReturnType<typeof listPricing>
>["fees"][number];
export type PricingLocation = Awaited<
  ReturnType<typeof listPricing>
>["locations"][number];
