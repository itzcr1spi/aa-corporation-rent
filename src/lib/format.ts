/** Format integer grosze (1/100 PLN) as a localized currency string, no decimals. */
export function formatPln(grosze: number, locale: string): string {
  return new Intl.NumberFormat(locale === "en" ? "en-GB" : "pl-PL", {
    style: "currency",
    currency: "PLN",
    maximumFractionDigits: 0,
  }).format(grosze / 100);
}
