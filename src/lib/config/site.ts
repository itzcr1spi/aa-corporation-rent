/**
 * Static brand + contact configuration (brand book §01, §12).
 * Business data that changes per-car or per-price lives in the DB (admin-editable),
 * not here. This is only immutable brand identity + company contact.
 */
export const siteConfig = {
  name: "A&A Corporation",
  tagline: "Premium Car Rental Warsaw",
  phone: "+48 884 762 950",
  phoneHref: "tel:+48884762950",
  email: "kontakt@aacorporation.pl",
  url: "https://www.aacorporation.pl",
  city: "Warszawa",
} as const;

/** Primary navigation. `key` maps to a translation in messages/*.json → Nav.<key>. */
export const mainNav = [
  { key: "fleet", href: "/fleet" },
  { key: "about", href: "/about" },
  { key: "howItWorks", href: "/how-it-works" },
  { key: "contact", href: "/contact" },
] as const;
