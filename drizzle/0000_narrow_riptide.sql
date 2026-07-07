CREATE TYPE "public"."car_category" AS ENUM('suv', 'sedan', 'van');--> statement-breakpoint
CREATE TYPE "public"."car_status" AS ENUM('available', 'rented', 'service', 'damaged');--> statement-breakpoint
CREATE TYPE "public"."fuel" AS ENUM('petrol', 'diesel', 'hybrid', 'electric');--> statement-breakpoint
CREATE TYPE "public"."gearbox" AS ENUM('automatic', 'manual');--> statement-breakpoint
CREATE TABLE "car_models" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"slug" text NOT NULL,
	"brand" text NOT NULL,
	"model" text NOT NULL,
	"year" integer NOT NULL,
	"category" "car_category" NOT NULL,
	"seats" integer NOT NULL,
	"gearbox" "gearbox" NOT NULL,
	"fuel" "fuel" NOT NULL,
	"km_per_day_limit" integer DEFAULT 0 NOT NULL,
	"daily_price_grosze" integer NOT NULL,
	"monthly_price_grosze" integer NOT NULL,
	"deposit_grosze" integer DEFAULT 0 NOT NULL,
	"description_pl" text,
	"description_en" text,
	"images" text[] DEFAULT '{}' NOT NULL,
	"sort_order" integer DEFAULT 0 NOT NULL,
	"published" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "car_models_slug_unique" UNIQUE("slug")
);
--> statement-breakpoint
CREATE TABLE "cars" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"model_id" uuid NOT NULL,
	"plate" text NOT NULL,
	"vin" text NOT NULL,
	"mileage_km" integer DEFAULT 0 NOT NULL,
	"registered_on" date,
	"insurance_expiry" date,
	"inspection_expiry" date,
	"status" "car_status" DEFAULT 'available' NOT NULL,
	"notes" text,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL,
	CONSTRAINT "cars_plate_unique" UNIQUE("plate"),
	CONSTRAINT "cars_vin_unique" UNIQUE("vin")
);
--> statement-breakpoint
CREATE TABLE "pickup_locations" (
	"id" uuid PRIMARY KEY DEFAULT gen_random_uuid() NOT NULL,
	"name" text NOT NULL,
	"address" text,
	"fee_grosze" integer DEFAULT 0 NOT NULL,
	"active" boolean DEFAULT true NOT NULL,
	"created_at" timestamp with time zone DEFAULT now() NOT NULL,
	"updated_at" timestamp with time zone DEFAULT now() NOT NULL
);
--> statement-breakpoint
ALTER TABLE "cars" ADD CONSTRAINT "cars_model_id_car_models_id_fk" FOREIGN KEY ("model_id") REFERENCES "public"."car_models"("id") ON DELETE restrict ON UPDATE no action;--> statement-breakpoint
CREATE INDEX "cars_model_id_idx" ON "cars" USING btree ("model_id");