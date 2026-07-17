// Client-safe enum values + Polish labels for the fleet editor. No server imports
// so both the form components and the server actions can share the source of truth.

export const CATEGORIES = ["suv", "sedan", "van"] as const;
export const GEARBOXES = ["automatic", "manual"] as const;
export const FUELS = ["petrol", "diesel", "hybrid", "electric"] as const;
export const CAR_STATUSES = ["available", "rented", "service", "damaged"] as const;

export type Category = (typeof CATEGORIES)[number];
export type Gearbox = (typeof GEARBOXES)[number];
export type Fuel = (typeof FUELS)[number];
export type CarStatus = (typeof CAR_STATUSES)[number];

export const CATEGORY_LABEL: Record<Category, string> = {
  suv: "SUV",
  sedan: "Sedan",
  van: "Van",
};

export const GEARBOX_LABEL: Record<Gearbox, string> = {
  automatic: "Automatyczna",
  manual: "Manualna",
};

export const FUEL_LABEL: Record<Fuel, string> = {
  petrol: "Benzyna",
  diesel: "Diesel",
  hybrid: "Hybryda",
  electric: "Elektryczny",
};

export const CAR_STATUS_LABEL: Record<CarStatus, string> = {
  available: "Dostępny",
  rented: "Wynajęty",
  service: "Serwis",
  damaged: "Uszkodzony",
};

export function isCategory(v: unknown): v is Category {
  return typeof v === "string" && (CATEGORIES as readonly string[]).includes(v);
}
export function isGearbox(v: unknown): v is Gearbox {
  return typeof v === "string" && (GEARBOXES as readonly string[]).includes(v);
}
export function isFuel(v: unknown): v is Fuel {
  return typeof v === "string" && (FUELS as readonly string[]).includes(v);
}
export function isCarStatus(v: unknown): v is CarStatus {
  return typeof v === "string" && (CAR_STATUSES as readonly string[]).includes(v);
}
