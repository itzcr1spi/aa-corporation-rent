import type { FeeCatalog } from "./types";

/**
 * Default fee catalog + pickup locations. PLACEHOLDER amounts (grosze) pending
 * real numbers from the client. These are the seed defaults; once the DB is live
 * they become admin-editable and the DB values win.
 */
export const FEE_DEFAULTS: FeeCatalog = {
  extraDriver: { amountGrosze: 100_00, unit: "per_rental" },
  childSeat: { amountGrosze: 20_00, unit: "per_day" },
  protectionPackage: { amountGrosze: 60_00, unit: "per_day" },
  noDeposit: { amountGrosze: 80_00, unit: "per_day" },
};

export type LocationOption = {
  slug: string;
  name: string; // PL
  nameEn: string; // EN
  address: string | null;
  feeGrosze: number;
  sortOrder: number;
};

export const LOCATION_DEFAULTS: LocationOption[] = [
  {
    slug: "office",
    name: "Odbiór w biurze (Warszawa)",
    nameEn: "Office pickup (Warsaw)",
    address: "Warszawa",
    feeGrosze: 0,
    sortOrder: 10,
  },
  {
    slug: "airport",
    name: "Lotnisko Chopina",
    nameEn: "Chopin Airport",
    address: "Warszawa, Lotnisko Chopina",
    feeGrosze: 200_00,
    sortOrder: 20,
  },
  {
    slug: "delivery",
    name: "Dostawa pod wskazany adres",
    nameEn: "Delivery to your address",
    address: null,
    feeGrosze: 150_00,
    sortOrder: 30,
  },
];

/** Booking rules (server-enforced). */
export const BOOKING_RULES = {
  minDays: 1,
  maxDays: 90,
  /** How far ahead a booking may start. */
  maxLeadDays: 365,
  /** Minimum driver age for premium rentals — adjust per client policy. */
  minAge: 21,
} as const;
