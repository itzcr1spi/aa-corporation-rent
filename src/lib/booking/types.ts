export type DepositVariant = "with_deposit" | "no_deposit";

/** Optional extras chosen in the calculator. */
export type BookingExtras = {
  extraDriver: boolean;
  childSeat: boolean;
  protectionPackage: boolean;
};

/** Fee catalog (grosze), resolved from the `fees` table or seed defaults. */
export type FeeCatalog = {
  extraDriver: { amountGrosze: number; unit: FeeUnit };
  childSeat: { amountGrosze: number; unit: FeeUnit };
  protectionPackage: { amountGrosze: number; unit: FeeUnit };
  noDeposit: { amountGrosze: number; unit: FeeUnit };
};

export type FeeUnit = "per_day" | "per_rental";

/** Everything the price engine needs — all server-sourced, never from the client. */
export type QuoteInput = {
  dailyPriceGrosze: number;
  depositGrosze: number;
  days: number;
  locationFeeGrosze: number;
  extras: BookingExtras;
  depositVariant: DepositVariant;
  fees: FeeCatalog;
};

export type QuoteLine = { code: string; amountGrosze: number };

export type QuoteBreakdown = {
  days: number;
  dailyPriceGrosze: number;
  rentalGrosze: number;
  lines: QuoteLine[];
  totalGrosze: number;
  /** Refundable deposit held (0 for the no-deposit variant). */
  depositGrosze: number;
};
