import { z } from "zod";
import { BOOKING_RULES } from "./fees";

const isoDate = z
  .string()
  .regex(/^\d{4}-\d{2}-\d{2}$/, "invalid_date")
  .refine((s) => !Number.isNaN(Date.parse(`${s}T00:00:00Z`)), "invalid_date");

function utcMidnight(iso: string): number {
  return Date.parse(`${iso}T00:00:00Z`);
}
function todayUtc(): number {
  const n = new Date();
  return Date.UTC(n.getUTCFullYear(), n.getUTCMonth(), n.getUTCDate());
}

/**
 * Boundary validation for a booking request. Everything an attacker can send is
 * checked here (types, formats, date order, past dates, min/max length, lead
 * time, enums) BEFORE any business logic. Note: NO price fields are accepted —
 * the total is computed server-side from DB prices, never taken from the client.
 */
export const bookingRequestSchema = z
  .object({
    modelSlug: z
      .string()
      .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/)
      .max(64),
    startDate: isoDate,
    endDate: isoDate,
    locationSlug: z.enum(["office", "airport", "delivery"]),
    extraDriver: z.boolean(),
    childSeat: z.boolean(),
    protectionPackage: z.boolean(),
    depositVariant: z.enum(["with_deposit", "no_deposit"]),
    customerName: z.string().trim().min(2).max(120),
    customerEmail: z.string().trim().email().max(200),
    customerPhone: z
      .string()
      .trim()
      .min(6)
      .max(32)
      .regex(/^[+0-9()\s-]+$/, "invalid_phone"),
  })
  .superRefine((v, ctx) => {
    const start = utcMidnight(v.startDate);
    const end = utcMidnight(v.endDate);
    const today = todayUtc();

    if (start < today) {
      ctx.addIssue({ code: "custom", path: ["startDate"], message: "past_date" });
    }
    if (end < start) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "end_before_start" });
    }
    const days = Math.round((end - start) / 86_400_000) + 1;
    if (days > BOOKING_RULES.maxDays) {
      ctx.addIssue({ code: "custom", path: ["endDate"], message: "too_long" });
    }
    if ((start - today) / 86_400_000 > BOOKING_RULES.maxLeadDays) {
      ctx.addIssue({ code: "custom", path: ["startDate"], message: "too_far" });
    }
  });

export type BookingRequest = z.infer<typeof bookingRequestSchema>;
