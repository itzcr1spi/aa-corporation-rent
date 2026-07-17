/** Format integer grosze (1/100 PLN) as a localized currency string, no decimals. */
export function formatPln(grosze: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(grosze / 100);
}

/** Format an ISO date (YYYY-MM-DD) as dd.mm.yyyy (no timezone math). */
export function formatDatePl(iso: string): string {
  const [y, m, d] = iso.split("-");
  return d && m && y ? `${d}.${m}.${y}` : iso;
}

/** Format a timestamp as a short PL date-time. */
export function formatDateTimePl(value: Date | string): string {
  const d = typeof value === "string" ? new Date(value) : value;
  return new Intl.DateTimeFormat("pl-PL", {
    dateStyle: "short",
    timeStyle: "short",
  }).format(d);
}
