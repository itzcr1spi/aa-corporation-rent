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
  slug: text("slug").notNull().unique(), // stable key: office | airport | delivery
  name: text("name").notNull(), // PL label
  nameEn: text("name_en"), // EN label
  address: text("address"),
  // Delivery/pickup fee in grosze. Office pickup = 0.
  feeGrosze: integer("fee_grosze").notNull().default(0),
  sortOrder: integer("sort_order").notNull().default(0),
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

// ── Booking enums ────────────────────────────────────────────────────────────
export const depositVariant = pgEnum("deposit_variant", [
  "with_deposit",
  "no_deposit",
]);
export const feeUnit = pgEnum("fee_unit", ["per_day", "per_rental"]);
export const reservationStatus = pgEnum("reservation_status", [
  "pending", // request submitted, does NOT block the calendar
  "confirmed", // admin-confirmed, BLOCKS the calendar (enforced by EXCLUDE)
  "cancelled",
  "completed",
  "rejected",
]);

// Statuses that occupy a car and must not overlap. Kept in sync with the SQL
// EXCLUDE constraint's WHERE clause (see drizzle/0001_no_double_booking.sql).
export const BLOCKING_STATUSES = ["confirmed", "completed"] as const;

// ── Extras / fees (admin-editable) ───────────────────────────────────────────
// Location fees (office/airport/delivery) live on pickup_locations. This table
// holds the optional extras from the price calculator.
export const fees = pgTable("fees", {
  id: uuid("id").defaultRandom().primaryKey(),
  code: text("code").notNull().unique(), // extra_driver | child_seat | protection_package | no_deposit
  amountGrosze: integer("amount_grosze").notNull(),
  unit: feeUnit("unit").notNull().default("per_rental"),
  active: boolean("active").notNull().default(true),
  updatedAt: timestamp("updated_at", { withTimezone: true })
    .notNull()
    .defaultNow(),
});

// ── Reservations ─────────────────────────────────────────────────────────────
// A reservation is attached to a physical car unit and a [start,end] date range.
// No-double-booking is enforced in the DB by a GiST EXCLUDE constraint over
// (car_id, daterange) for BLOCKING_STATUSES — not in application code.
// The full price breakdown is snapshotted (server-computed) so it can never be
// altered by re-reading current prices, and for audit/invoicing.
export const reservations = pgTable(
  "reservations",
  {
    id: uuid("id").defaultRandom().primaryKey(),
    reference: text("reference").notNull().unique(),
    carModelId: uuid("car_model_id")
      .notNull()
      .references(() => carModels.id, { onDelete: "restrict" }),
    carId: uuid("car_id")
      .notNull()
      .references(() => cars.id, { onDelete: "restrict" }),
    startDate: date("start_date").notNull(),
    endDate: date("end_date").notNull(),
    days: integer("days").notNull(),
    pickupLocationId: uuid("pickup_location_id")
      .notNull()
      .references(() => pickupLocations.id, { onDelete: "restrict" }),
    extraDriver: boolean("extra_driver").notNull().default(false),
    childSeat: boolean("child_seat").notNull().default(false),
    protectionPackage: boolean("protection_package").notNull().default(false),
    depositVariant: depositVariant("deposit_variant")
      .notNull()
      .default("with_deposit"),
    // Server-computed price snapshot (grosze). `quote` holds the full line-item
    // breakdown as JSON for audit; the columns below are the headline figures.
    totalGrosze: integer("total_grosze").notNull(),
    depositGrosze: integer("deposit_grosze").notNull().default(0),
    quote: text("quote").notNull(), // JSON string of the QuoteBreakdown
    // Basic contact captured at request time; full client data + docs in Phase 4.
    customerName: text("customer_name").notNull(),
    customerEmail: text("customer_email").notNull(),
    customerPhone: text("customer_phone").notNull(),
    status: reservationStatus("status").notNull().default("pending"),
    createdAt: timestamp("created_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
    updatedAt: timestamp("updated_at", { withTimezone: true })
      .notNull()
      .defaultNow(),
  },
  (t) => [
    index("reservations_car_id_idx").on(t.carId),
    index("reservations_car_model_id_idx").on(t.carModelId),
    index("reservations_status_idx").on(t.status),
  ],
);

export type PickupLocation = typeof pickupLocations.$inferSelect;
export type NewPickupLocation = typeof pickupLocations.$inferInsert;
export type CarModel = typeof carModels.$inferSelect;
export type NewCarModel = typeof carModels.$inferInsert;
export type Car = typeof cars.$inferSelect;
export type NewCar = typeof cars.$inferInsert;
export type Fee = typeof fees.$inferSelect;
export type Reservation = typeof reservations.$inferSelect;
export type NewReservation = typeof reservations.$inferInsert;
