CREATE TYPE "public"."deposit_variant" AS ENUM('with_deposit', 'no_deposit');--> statement-breakpoint
CREATE TYPE "public"."fee_unit" AS ENUM('per_day', 'per_rental');--> statement-breakpoint
CREATE TYPE "public"."reservation_status" AS ENUM('pending', 'confirmed', 'cancelled', 'completed', 'rejected');--> statement-breakpoint
CREATE TABLE "fees" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"code" text NOT NULL,
	"amount_grosze" integer NOT NULL,
	"unit" "fee_unit" DEFAULT 'per_rental' NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "fees_code_unique" UNIQUE("code")
);
--> statement-breakpoint
CREATE TABLE "reservations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"reference" text NOT NULL,
	"car_model_id" uuid NOT NULL,
	"car_id" uuid NOT NULL,
	"start_date" date NOT NULL,
	"end_date" date NOT NULL,
	"days" integer NOT NULL,
	"pickup_location_id" uuid NOT NULL,
	"extra_driver" boolean DEFAULT false NOT NULL,
	"child_seat" boolean DEFAULT false NOT NULL,
	"protection_package" boolean DEFAULT false NOT NULL,
	"deposit_variant" "deposit_variant" DEFAULT 'with_deposit' NOT NULL,
	"total_grosze" integer NOT NULL,
	"deposit_grosze" integer DEFAULT 0 NOT NULL,
	"quote" text NOT NULL,
	"customer_name" text NOT NULL,
	"customer_email" text NOT NULL,
	"customer_phone" text NOT NULL,
	"status" "reservation_status" DEFAULT 'pending' NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "reservations_reference_unique" UNIQUE("reference")
);
--> statement-breakpoint
ALTER TABLE "pickup_locations" ADD COLUMN "slug" text NOT NULL;--> statement-breakpoint
ALTER TABLE "pickup_locations" ADD COLUMN "name_en" text;--> statement-breakpoint
ALTER TABLE "pickup_locations" ADD COLUMN "sort_order" integer DEFAULT 0 NOT NULL;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_car_model_id_car_models_id_fk" FOREIGN KEY ("car_model_id") REFERENCES "public"."car_models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_car_id_cars_id_fk" FOREIGN KEY ("car_id") REFERENCES "public"."cars"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_pickup_location_id_pickup_locations_id_fk" FOREIGN KEY ("pickup_location_id") REFERENCES "public"."pickup_locations"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "reservations_car_id_idx" ON "reservations" USING btree ("car_id");--> statement-breakpoint
CREATE INDEX "reservations_car_model_id_idx" ON "reservations" USING btree ("car_model_id");--> statement-breakpoint
CREATE INDEX "reservations_status_idx" ON "reservations" USING btree ("status");--> statement-breakpoint
ALTER TABLE "pickup_locations" ADD CONSTRAINT "pickup_locations_slug_unique" UNIQUE("slug");--> statement-breakpoint
-- No-double-booking, enforced by the database (not application code).
-- Two BLOCKING reservations (confirmed/completed) for the same car unit whose
-- inclusive date ranges overlap cannot both exist. Concurrent transactions that
-- would violate this are rejected at COMMIT — races cannot double-book a car.
CREATE EXTENSION IF NOT EXISTS btree_gist;--> statement-breakpoint
ALTER TABLE "reservations" ADD CONSTRAINT "reservations_no_double_booking" EXCLUDE USING gist ("car_id" WITH =, daterange("start_date", "end_date", '[]') WITH &&) WHERE (status IN ('confirmed', 'completed'));