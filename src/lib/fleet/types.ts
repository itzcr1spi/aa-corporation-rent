export type CarCategory = "suv" | "sedan" | "van";
export type Gearbox = "automatic" | "manual";
export type Fuel = "petrol" | "diesel" | "hybrid" | "electric";
export type CarStatus = "available" | "rented" | "service" | "damaged";

/** UI-facing shape for a listing (one model), independent of the storage backend. */
export type FleetCar = {
  slug: string;
  brand: string;
  model: string;
  year: number;
  category: CarCategory;
  seats: number;
  gearbox: Gearbox;
  fuel: Fuel;
  kmPerDayLimit: number;
  dailyPriceGrosze: number;
  monthlyPriceGrosze: number;
  depositGrosze: number;
  descriptionPl: string | null;
  descriptionEn: string | null;
  images: string[];
  unitCount: number;
  availableCount: number;
};
