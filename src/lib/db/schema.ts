import {
  pgTable,
  uuid,
  text,
  integer,
  boolean,
  timestamp,
} from "drizzle-orm/pg-core";

/**
 * Foundational schema.
 *
 * Domain tables (car_models, cars, reservations, clients, documents, contracts,
 * invoices) are introduced in later phases alongside the features that need them.
 * The no-double-booking rule will be enforced with a Postgres EXCLUDE constraint
 * over a daterange + car_id (GiST) at the reservation-schema phase — not in the UI.
 *
 * Money convention: store amounts as integer **grosze** (1/100 PLN) everywhere to
 * avoid floating-point rounding. Never store prices as floats.
 */

// Pickup locations are admin-editable (per client: keep addresses editable in the
// panel). Seeded here as the first real table so the DB pipeline is exercisable.
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

export type PickupLocation = typeof pickupLocations.$inferSelect;
export type NewPickupLocation = typeof pickupLocations.$inferInsert;
