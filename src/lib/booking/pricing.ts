import type { FeeUnit, QuoteBreakdown, QuoteInput, QuoteLine } from "./types";

/** Rental length in whole days, inclusive of both endpoints (min 1). */
export function rentalDays(start: Date, end: Date): number {
  const MS_PER_DAY = 24 * 60 * 60 * 1000;
  const a = Date.UTC(start.getFullYear(), start.getMonth(), start.getDate());
  const b = Date.UTC(end.getFullYear(), end.getMonth(), end.getDate());
  return Math.max(1, Math.round((b - a) / MS_PER_DAY) + 1);
}

function feeAmount(amountGrosze: number, unit: FeeUnit, days: number): number {
  return unit === "per_day" ? amountGrosze * days : amountGrosze;
}

/**
 * THE authoritative price. Pure and deterministic — the server calls this with
 * DB-sourced numbers at submit time and stores the result on the reservation.
 * The client runs the same function for a live preview, but its output is never
 * trusted: whatever the client sends is ignored and this is recomputed.
 *
 * All amounts are integer grosze.
 */
export function computeQuote(input: QuoteInput): QuoteBreakdown {
  const days = Math.max(1, Math.floor(input.days));
  const rentalGrosze = input.dailyPriceGrosze * days;

  const lines: QuoteLine[] = [];

  if (input.locationFeeGrosze > 0) {
    lines.push({ code: "location", amountGrosze: input.locationFeeGrosze });
  }
  if (input.extras.extraDriver) {
    lines.push({
      code: "extra_driver",
      amountGrosze: feeAmount(
        input.fees.extraDriver.amountGrosze,
        input.fees.extraDriver.unit,
        days,
      ),
    });
  }
  if (input.extras.childSeat) {
    lines.push({
      code: "child_seat",
      amountGrosze: feeAmount(
        input.fees.childSeat.amountGrosze,
        input.fees.childSeat.unit,
        days,
      ),
    });
  }
  if (input.extras.protectionPackage) {
    lines.push({
      code: "protection_package",
      amountGrosze: feeAmount(
        input.fees.protectionPackage.amountGrosze,
        input.fees.protectionPackage.unit,
        days,
      ),
    });
  }

  // Deposit variant B (no deposit) waives the deposit but adds a fee; variant A
  // charges (holds) the refundable deposit instead.
  const noDeposit = input.depositVariant === "no_deposit";
  if (noDeposit) {
    lines.push({
      code: "no_deposit",
      amountGrosze: feeAmount(
        input.fees.noDeposit.amountGrosze,
        input.fees.noDeposit.unit,
        days,
      ),
    });
  }

  const totalGrosze =
    rentalGrosze + lines.reduce((sum, l) => sum + l.amountGrosze, 0);

  return {
    days,
    dailyPriceGrosze: input.dailyPriceGrosze,
    rentalGrosze,
    lines,
    totalGrosze,
    depositGrosze: noDeposit ? 0 : input.depositGrosze,
  };
}
