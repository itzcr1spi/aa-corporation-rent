import { defineRouting } from "next-intl/routing";

// PL is the primary market → served at the root (`/`). EN is prefixed (`/en`).
// localeDetection is off: `/` ALWAYS serves Polish regardless of the browser's
// Accept-Language; English is reached explicitly via the switcher (`/en`).
export const routing = defineRouting({
  locales: ["pl", "en"],
  defaultLocale: "pl",
  localePrefix: "as-needed",
  localeDetection: false,
});

export type Locale = (typeof routing.locales)[number];
