import { defineRouting } from "next-intl/routing";

// PL is the primary market → served at the root (`/`). EN is prefixed (`/en`).
export const routing = defineRouting({
  locales: ["pl", "en"],
  defaultLocale: "pl",
  localePrefix: "as-needed",
});

export type Locale = (typeof routing.locales)[number];
