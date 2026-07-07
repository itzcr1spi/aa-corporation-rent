import {
  pgTable,
  pgEnum,
  uuid,
  text,
  integer,
  boolean,
  date,
  timestamp,
  index,
} from "drizzle-orm/pg-core";

/**
 * Money convention: store amounts as integer **grosze** (1/100 PLN) everywhere to
 * avoid floating-point rounding. Never store prices as floats.
 *
 * Reservations, clients, documents, contracts and invoices arrive in later phases.
 * The no-double-booking rule will be enforced with a Postgres EXCLUDE constraint
 * over a daterange + car_id (GiST) at the reservation-schema phase — not in the UI.
 */

// ── Enums ────────────────────────────────────────────────────────────────────
export const carCategory = pgEnum("car_category", ["suv", "sedan", "van"]);
export const gearbox = pgEnum("gearbox", ["automatic", "manual"]);
export const fuel = pgEnum("fuel", ["petrol", "diesel", "hybrid", "electric"]);
export const carStatus = pgEnum("car_status", [
  "available",
  "rented",
  "service",
  "damaged",
]);

// ── Pickup locations (admin-editable) ────────────────────────────────────────
export const pickupLocations = pgTable("pickup_locations", {
  id: uuid("id").defaultRandom().primaryKey(),
  name: text("name").notNull(),
  address: text("address"),
  // Delivery/pickup fee in grosze. Office pickup = 0.
  feeGrosze: integer("fee_grosze").notNull().default(0),
  active: boolean("active").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Car models = one public listing ──────────────────────────────────────────
// Prices/specs live here and are admin-editable; never hardcode them in the UI.
export const carModels = pgTable("car_models", {
  id: uuid("id").defaultRandom().primaryKey(),
  slug: text("slug").notNull().unique(),
  brand: text("brand").notNull(),
  model: text("model").notNull(),
  year: integer("year").notNull(),
  category: carCategory("category").notNull(),
  seats: integer("seats").notNull(),
  gearbox: gearbox("gearbox").notNull(),
  fuel: fuel("fuel").notNull(),
  // Daily included-km allowance; 0 means unlimited.
  kmPerDayLimit: integer("km_per_day_limit").notNull().default(0),
  dailyPriceGrosze: integer("daily_price_grosze").notNull(),
  monthlyPriceGrosze: integer("monthly_price_grosze").notNull(),
  depositGrosze: integer("deposit_grosze").notNull().default(0),
  descriptionPl: text("description_pl"),
  descriptionEn: text("description_en"),
  // Public image paths (or storage keys once photos move to object storage).
  images: text("images").array().notNull().default([]),
  sortOrder: integer("sort_order").notNull().default(0),
  published: boolean("published").notNull().default(true),
  createdAt: timestamp("created_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Cars = physical units of a model ─────────────────────────────────────────
// Units of the same model share one listing but are distinct cars (plate/VIN/
// mileage/insurance). Availability & bookings (Phase 3) attach to a unit, not a model.
export const cars = pgTable(
  "cars",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    modelId: uuid("model_id")
      .notNull()
      .references(() => carModels.id, { onDelete: "restrict" }),
    plate: text("plate").notNull().unique(),
    vin: text("vin").notNull().unique(),
    mileageKm: integer("mileage_km").notNull().default(0),
    registeredOn: date("registered_on"),
    insuranceExpiry: date("insurance_expiry"),
    inspectionExpiry: date("inspection_expiry"),
    status: carStatus("status").notNull().default("available"),
    notes: text("notes"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [index("cars_model_id_idx").on(t.modelId)],
);

export type PickupLocation = typeof pickupLocations.$inferSelect;
export type NewPickupLocation = typeof pickupLocations.$inferInsert;
export type CarModel = typeof carModels.$inferSelect;
export type NewCarModel = typeof carModels.$inferInsert;
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;
