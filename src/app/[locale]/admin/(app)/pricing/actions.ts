"use server";

import { revalidatePath } from "next/cache";
import { eq } from "drizzle-orm";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { recordAudit } from "@/lib/auth/audit";

export type SaveResult = { ok: true } | { ok: false; error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const MAX_PLN = 1_000_000; // 1M zł ceiling — anything larger is a typo/attack.

/** Parse a złoty amount (accepts "450", "450.50", "450,50") to integer grosze. */
function parseGrosze(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string") return null;
  const normalized = v.replace(/\s/g, "").replace(",", ".");
  if (normalized === "") return null;
  const n = Number(normalized);
  if (!Number.isFinite(n) || n < 0 || n > MAX_PLN) return null;
  return Math.round(n * 100);
}

function parseCount(v: FormDataEntryValue | null): number | null {
  if (typeof v !== "string") return null;
  const n = Number(v.trim());
  if (!Number.isInteger(n) || n < 0 || n > 100_000) return null;
  return n;
}

const INVALID: SaveResult = { ok: false, error: "Nieprawidłowe dane." };

export async function updateModelPricing(
  _prev: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const daily = parseGrosze(formData.get("daily"));
  const monthly = parseGrosze(formData.get("monthly"));
  const deposit = parseGrosze(formData.get("deposit"));
  const kmPerDay = parseCount(formData.get("kmPerDay"));
  if (
    !UUID_RE.test(id) ||
    daily === null ||
    monthly === null ||
    deposit === null ||
    kmPerDay === null
  ) {
    return INVALID;
  }

  const db = getDb();
  try {
    const [before] = await db
      .select({
        dailyPriceGrosze: schema.carModels.dailyPriceGrosze,
        monthlyPriceGrosze: schema.carModels.monthlyPriceGrosze,
        depositGrosze: schema.carModels.depositGrosze,
        kmPerDayLimit: schema.carModels.kmPerDayLimit,
      })
      .from(schema.carModels)
      .where(eq(schema.carModels.id, id))
      .limit(1);
    if (!before) return { ok: false, error: "Nie znaleziono modelu." };

    const after = {
      dailyPriceGrosze: daily,
      monthlyPriceGrosze: monthly,
      depositGrosze: deposit,
      kmPerDayLimit: kmPerDay,
    };
    await db
      .update(schema.carModels)
      .set({ ...after, updatedAt: new Date() })
      .where(eq(schema.carModels.id, id));

    await recordAudit({
      adminId: admin.id,
      action: "pricing.model.update",
      entity: "car_model",
      entityId: id,
      before,
      after,
    });
    revalidatePath("/admin/pricing");
    return { ok: true };
  } catch (err) {
    console.error("updateModelPricing failed:", err);
    return { ok: false, error: "Wystąpił błąd. Spróbuj ponownie." };
  }
}

export async function updateFee(
  _prev: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const amount = parseGrosze(formData.get("amount"));
  const unitRaw = String(formData.get("unit") ?? "");
  const unit: "per_day" | "per_rental" | null =
    unitRaw === "per_day" || unitRaw === "per_rental" ? unitRaw : null;
  const active = formData.get("active") === "on";
  if (!UUID_RE.test(id) || amount === null || unit === null) return INVALID;

  const db = getDb();
  try {
    const [before] = await db
      .select({
        amountGrosze: schema.fees.amountGrosze,
        unit: schema.fees.unit,
        active: schema.fees.active,
      })
      .from(schema.fees)
      .where(eq(schema.fees.id, id))
      .limit(1);
    if (!before) return { ok: false, error: "Nie znaleziono opłaty." };

    const after = { amountGrosze: amount, unit, active };
    await db
      .update(schema.fees)
      .set({ ...after, updatedAt: new Date() })
      .where(eq(schema.fees.id, id));

    await recordAudit({
      adminId: admin.id,
      action: "pricing.fee.update",
      entity: "fee",
      entityId: id,
      before,
      after,
    });
    revalidatePath("/admin/pricing");
    return { ok: true };
  } catch (err) {
    console.error("updateFee failed:", err);
    return { ok: false, error: "Wystąpił błąd. Spróbuj ponownie." };
  }
}

export async function updatePickupLocation(
  _prev: SaveResult | null,
  formData: FormData,
): Promise<SaveResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  const fee = parseGrosze(formData.get("fee"));
  const active = formData.get("active") === "on";
  if (!UUID_RE.test(id) || fee === null) return INVALID;

  const db = getDb();
  try {
    const [before] = await db
      .select({
        feeGrosze: schema.pickupLocations.feeGrosze,
        active: schema.pickupLocations.active,
      })
      .from(schema.pickupLocations)
      .where(eq(schema.pickupLocations.id, id))
      .limit(1);
    if (!before) return { ok: false, error: "Nie znaleziono lokalizacji." };

    const after = { feeGrosze: fee, active };
    await db
      .update(schema.pickupLocations)
      .set({ ...after, updatedAt: new Date() })
      .where(eq(schema.pickupLocations.id, id));

    await recordAudit({
      adminId: admin.id,
      action: "pricing.location.update",
      entity: "pickup_location",
      entityId: id,
      before,
      after,
    });
    revalidatePath("/admin/pricing");
    return { ok: true };
  } catch (err) {
    console.error("updatePickupLocation failed:", err);
    return { ok: false, error: "Wystąpił błąd. Spróbuj ponownie." };
  }
}
