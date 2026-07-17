import "server-only";
import { asc, eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";

/** All models with a rolled-up count of their physical units. */
export async function listFleet() {
  const db = getDb();
  const [models, units] = await Promise.all([
    db
      .select({
        id: schema.carModels.id,
        slug: schema.carModels.slug,
        brand: schema.carModels.brand,
        model: schema.carModels.model,
        year: schema.carModels.year,
        category: schema.carModels.category,
        dailyPriceGrosze: schema.carModels.dailyPriceGrosze,
        published: schema.carModels.published,
        sortOrder: schema.carModels.sortOrder,
      })
      .from(schema.carModels)
      .orderBy(asc(schema.carModels.sortOrder), asc(schema.carModels.brand)),
    db
      .select({ modelId: schema.cars.modelId, status: schema.cars.status })
      .from(schema.cars),
  ]);

  const counts = new Map<string, { total: number; available: number }>();
  for (const u of units) {
    const e = counts.get(u.modelId) ?? { total: 0, available: 0 };
    e.total += 1;
    if (u.status === "available") e.available += 1;
    counts.set(u.modelId, e);
  }

  return models.map((m) => ({
    ...m,
    units: counts.get(m.id) ?? { total: 0, available: 0 },
  }));
}

/** One model plus its physical units, for the editor. */
export async function getModelWithUnits(id: string) {
  const db = getDb();
  const [model] = await db
    .select()
    .from(schema.carModels)
    .where(eq(schema.carModels.id, id))
    .limit(1);
  if (!model) return null;

  const units = await db
    .select()
    .from(schema.cars)
    .where(eq(schema.cars.modelId, id))
    .orderBy(asc(schema.cars.plate));

  return { model, units };
}

export type FleetModel = Awaited<ReturnType<typeof listFleet>>[number];
export type FleetUnit = NonNullable<
  Awaited<ReturnType<typeof getModelWithUnits>>
>["units"][number];
export type EditableModel = NonNullable<
  Awaited<ReturnType<typeof getModelWithUnits>>
>["model"];
