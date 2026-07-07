import type { CarStatus } from "./types";

/**
 * Seed fleet — the single source of truth for both the DB seed script and the
 * no-DB fallback the repository uses before a database is provisioned.
 *
 * PRICES ARE PLACEHOLDERS (integer grosze) pending real numbers from the client.
 * Once the DB is live these become admin-editable and the seed only sets defaults.
 *
 * Starting fleet (per brief): Toyota RAV4 ×4, Volvo XC60 ×1, BMW 740d ×1,
 * Renault Trafic ×1 — units of the same model are separate physical cars.
 */
export type FleetUnitSeed = {
  plate: string;
  vin: string;
  mileageKm: number;
  status: CarStatus;
};

export type FleetModelSeed = {
  slug: string;
  brand: string;
  model: string;
  year: number;
  category: "suv" | "sedan" | "van";
  seats: number;
  gearbox: "automatic" | "manual";
  fuel: "petrol" | "diesel" | "hybrid" | "electric";
  kmPerDayLimit: number; // 0 = unlimited
  dailyPriceGrosze: number;
  monthlyPriceGrosze: number;
  depositGrosze: number;
  descriptionPl: string;
  descriptionEn: string;
  images: string[];
  sortOrder: number;
  units: FleetUnitSeed[];
};

const zl = (amount: number) => amount * 100; // zł → grosze

export const FLEET: FleetModelSeed[] = [
  {
    slug: "bmw-740d",
    brand: "BMW",
    model: "740d xDrive",
    year: 2019,
    category: "sedan",
    seats: 5,
    gearbox: "automatic",
    fuel: "diesel",
    kmPerDayLimit: 300,
    dailyPriceGrosze: zl(800),
    monthlyPriceGrosze: zl(15000),
    depositGrosze: zl(5000),
    descriptionPl:
      "Reprezentacyjna limuzyna klasy premium. Idealna na spotkania biznesowe, transfery lotniskowe i wymagające wyjazdy.",
    descriptionEn:
      "A flagship executive sedan. Ideal for business meetings, airport transfers and demanding journeys.",
    images: ["/fleet/bmw-740d.jpg"],
    sortOrder: 10,
    units: [
      {
        plate: "EL 2AN46",
        vin: "WBA7E2C50KG000001",
        mileageKm: 92000,
        status: "available",
      },
    ],
  },
  {
    slug: "volvo-xc60",
    brand: "Volvo",
    model: "XC60",
    year: 2022,
    category: "suv",
    seats: 5,
    gearbox: "automatic",
    fuel: "diesel",
    kmPerDayLimit: 300,
    dailyPriceGrosze: zl(400),
    monthlyPriceGrosze: zl(8000),
    depositGrosze: zl(3000),
    descriptionPl:
      "Skandynawski SUV klasy premium — komfort, bezpieczeństwo i elegancja na każdą trasę.",
    descriptionEn:
      "A premium Scandinavian SUV — comfort, safety and elegance for every route.",
    images: ["/fleet/volvo-xc60.jpg"],
    sortOrder: 20,
    units: [
      {
        plate: "WX 1000A",
        vin: "YV1UZ00000A000002",
        mileageKm: 41000,
        status: "available",
      },
    ],
  },
  {
    slug: "toyota-rav4",
    brand: "Toyota",
    model: "RAV4 Hybrid",
    year: 2022,
    category: "suv",
    seats: 5,
    gearbox: "automatic",
    fuel: "hybrid",
    kmPerDayLimit: 300,
    dailyPriceGrosze: zl(300),
    monthlyPriceGrosze: zl(6000),
    depositGrosze: zl(2000),
    descriptionPl:
      "Ekonomiczny, niezawodny SUV hybrydowy. Doskonały do miasta i na dłuższe trasy.",
    descriptionEn:
      "An economical, dependable hybrid SUV. Perfect for the city and longer trips.",
    images: ["/fleet/toyota-rav4.jpg"],
    sortOrder: 30,
    units: [
      { plate: "WX 2001B", vin: "JTMB00000N0000003", mileageKm: 38000, status: "available" },
      { plate: "WX 2002B", vin: "JTMB00000N0000004", mileageKm: 45000, status: "available" },
      { plate: "WX 2003B", vin: "JTMB00000N0000005", mileageKm: 51000, status: "rented" },
      { plate: "WX 2004B", vin: "JTMB00000N0000006", mileageKm: 29000, status: "available" },
    ],
  },
  {
    slug: "renault-trafic",
    brand: "Renault",
    model: "Trafic",
    year: 2021,
    category: "van",
    seats: 9,
    gearbox: "manual",
    fuel: "diesel",
    kmPerDayLimit: 300,
    dailyPriceGrosze: zl(350),
    monthlyPriceGrosze: zl(7000),
    depositGrosze: zl(2500),
    descriptionPl:
      "Przestronny bus 9-osobowy. Idealny na wyjazdy grupowe, transfery i przewóz bagażu.",
    descriptionEn:
      "A spacious 9-seat van. Ideal for group trips, transfers and luggage.",
    images: ["/fleet/renault-trafic.jpg"],
    sortOrder: 40,
    units: [
      {
        plate: "WX 3001C",
        vin: "VF1FL000000000007",
        mileageKm: 63000,
        status: "available",
      },
    ],
  },
];
