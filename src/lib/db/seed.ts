/**
 * Idempotent-ish seed for local/dev databases. Run once against an empty schema:
 *   DATABASE_URL=... npm run db:seed
 *
 * Uses the same FLEET fixtures the no-DB fallback renders from, so dev data and
 * the demo content stay in sync. Prices are placeholders — real values are set in
 * the admin panel later.
 */
import { drizzle } from "drizzle-orm/postgres-js";
import postgres from "postgres";
import * as schema from "./schema";
import { FLEET } from "../fleet/data";

async function main() {
  const url = process.env.DATABASE_URL;
  if (!url) throw new Error("DATABASE_URL is required to seed.");

  const client = postgres(url, { max: 1 });
  const db = drizzle(client, { schema });

  console.log(`Seeding ${FLEET.length} models…`);
  for (const m of FLEET) {
    const [model] = await db
      .insert(schema.carModels)
      .values({
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
        sortOrder: m.sortOrder,
      })
      .onConflictDoNothing({ target: schema.carModels.slug })
      .returning();

    if (!model) {
      console.log(`  · ${m.slug} already present, skipping`);
      continue;
    }

    await db.insert(schema.cars).values(
      m.units.map((u) => ({
        modelId: model.id,
        plate: u.plate,
        vin: u.vin,
        mileageKm: u.mileageKm,
        status: u.status,
      })),
    );
    console.log(`  ✓ ${m.slug} (+${m.units.length} unit(s))`);
  }

  await client.end();
  console.log("Done.");
}

main().catch((err) => {
  console.error(err);
  process.exit(1);
});
