"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { count, eq } from "drizzle-orm";
import { z } from "zod";
import { getDb, schema } from "@/lib/db";
import { requireAdmin } from "@/lib/auth/guard";
import { recordAudit } from "@/lib/auth/audit";
import { CATEGORIES, GEARBOXES, FUELS, CAR_STATUSES } from "@/lib/admin/fleet-options";

export type FormResult = { ok: true } | { ok: false; error: string };

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;
const SLUG_RE = /^[a-z0-9]+(?:-[a-z0-9]+)*$/;

/** "450" | "450,50" | "450.50" → integer grosze; empty → 0. */
const moneyPln = z.preprocess(
  (v) =>
    typeof v === "string"
      ? Number(v.replace(/\s/g, "").replace(",", ".") || "0")
      : v,
  z
    .number()
    .min(0)
    .max(1_000_000)
    .transform((n) => Math.round(n * 100)),
);

const dateOrNull = z.preprocess(
  (v) => (typeof v === "string" && v.trim() !== "" ? v.trim() : null),
  z
    .string()
    .regex(/^\d{4}-\d{2}-\d{2}$/)
    .nullable(),
);

const bool = z.preprocess((v) => v === "on" || v === "true", z.boolean());

const ModelSchema = z.object({
  slug: z.string().regex(SLUG_RE).max(60),
  brand: z.string().trim().min(1).max(60),
  model: z.string().trim().min(1).max(60),
  year: z.coerce.number().int().min(1990).max(2100),
  category: z.enum(CATEGORIES),
  seats: z.coerce.number().int().min(1).max(9),
  gearbox: z.enum(GEARBOXES),
  fuel: z.enum(FUELS),
  kmPerDayLimit: z.coerce.number().int().min(0).max(100_000),
  daily: moneyPln,
  monthly: moneyPln,
  deposit: moneyPln,
  sortOrder: z.coerce.number().int().min(0).max(9999),
  published: bool,
  descriptionPl: z
    .string()
    .max(5000)
    .transform((s) => s.trim() || null),
  descriptionEn: z
    .string()
    .max(5000)
    .transform((s) => s.trim() || null),
  images: z
    .string()
    .transform((s) => s.split("\n").map((x) => x.trim()).filter(Boolean))
    .refine((a) => a.length <= 20, "za dużo zdjęć"),
});

const CarSchema = z.object({
  modelId: z.string().regex(UUID_RE),
  plate: z
    .string()
    .trim()
    .min(1)
    .max(15)
    .transform((s) => s.toUpperCase()),
  vin: z
    .string()
    .trim()
    .min(5)
    .max(20)
    .transform((s) => s.toUpperCase()),
  mileageKm: z.coerce.number().int().min(0).max(2_000_000),
  status: z.enum(CAR_STATUSES),
  registeredOn: dateOrNull,
  insuranceExpiry: dateOrNull,
  inspectionExpiry: dateOrNull,
  notes: z.string().max(2000).transform((s) => s.trim() || null),
});

const FIELD_LABEL: Record<string, string> = {
  slug: "identyfikator (slug)",
  brand: "marka",
  model: "model",
  year: "rok",
  seats: "liczba miejsc",
  daily: "cena za dobę",
  monthly: "cena miesięczna",
  plate: "rejestracja",
  vin: "VIN",
  mileageKm: "przebieg",
};

function zodError(e: z.ZodError): FormResult {
  const first = e.issues[0];
  const key = first?.path[0];
  const label = typeof key === "string" ? (FIELD_LABEL[key] ?? key) : "";
  return {
    ok: false,
    error: label ? `Sprawdź pole: ${label}.` : "Nieprawidłowe dane formularza.",
  };
}

function hasCode(err: unknown, code: string): boolean {
  return (
    typeof err === "object" &&
    err !== null &&
    "code" in err &&
    (err as { code?: string }).code === code
  );
}
const isUnique = (e: unknown) => hasCode(e, "23505"); // unique_violation
const isFkInUse = (e: unknown) => hasCode(e, "23503"); // foreign_key_violation

function modelRow(d: z.infer<typeof ModelSchema>) {
  return {
    slug: d.slug,
    brand: d.brand,
    model: d.model,
    year: d.year,
    category: d.category,
    seats: d.seats,
    gearbox: d.gearbox,
    fuel: d.fuel,
    kmPerDayLimit: d.kmPerDayLimit,
    dailyPriceGrosze: d.daily,
    monthlyPriceGrosze: d.monthly,
    depositGrosze: d.deposit,
    sortOrder: d.sortOrder,
    published: d.published,
    descriptionPl: d.descriptionPl,
    descriptionEn: d.descriptionEn,
    images: d.images,
  };
}

// ── Models ───────────────────────────────────────────────────────────────────

export async function createModel(
  _prev: FormResult | null,
  formData: FormData,
): Promise<FormResult> {
  const admin = await requireAdmin();
  const parsed = ModelSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodError(parsed.error);
  const values = modelRow(parsed.data);

  const db = getDb();
  let newId: string;
  try {
    const [row] = await db
      .insert(schema.carModels)
      .values(values)
      .returning({ id: schema.carModels.id });
    newId = row.id;
  } catch (err) {
    if (isUnique(err))
      return { ok: false, error: "Model z tym identyfikatorem już istnieje." };
    console.error("createModel failed:", err);
    return { ok: false, error: "Wystąpił błąd. Spróbuj ponownie." };
  }

  await recordAudit({
    adminId: admin.id,
    action: "fleet.model.create",
    entity: "car_model",
    entityId: newId,
    after: values,
  });
  revalidatePath("/admin/fleet");
  redirect(`/admin/fleet/${newId}`);
}

export async function updateModel(
  _prev: FormResult | null,
  formData: FormData,
): Promise<FormResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { ok: false, error: "Nieprawidłowe dane." };
  const parsed = ModelSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodError(parsed.error);
  const values = modelRow(parsed.data);

  const db = getDb();
  try {
    const [before] = await db
      .select()
      .from(schema.carModels)
      .where(eq(schema.carModels.id, id))
      .limit(1);
    if (!before) return { ok: false, error: "Nie znaleziono modelu." };

    await db
      .update(schema.carModels)
      .set({ ...values, updatedAt: new Date() })
      .where(eq(schema.carModels.id, id));

    await recordAudit({
      adminId: admin.id,
      action: "fleet.model.update",
      entity: "car_model",
      entityId: id,
      before,
      after: values,
    });
    revalidatePath("/admin/fleet");
    revalidatePath(`/admin/fleet/${id}`);
    return { ok: true };
  } catch (err) {
    if (isUnique(err))
      return { ok: false, error: "Model z tym identyfikatorem już istnieje." };
    console.error("updateModel failed:", err);
    return { ok: false, error: "Wystąpił błąd. Spróbuj ponownie." };
  }
}

export async function deleteModel(id: string): Promise<FormResult> {
  const admin = await requireAdmin();
  if (!UUID_RE.test(id)) return { ok: false, error: "Nieprawidłowe dane." };
  const db = getDb();

  const [[{ cars: carN }], [{ res: resN }]] = await Promise.all([
    db
      .select({ cars: count() })
      .from(schema.cars)
      .where(eq(schema.cars.modelId, id)),
    db
      .select({ res: count() })
      .from(schema.reservations)
      .where(eq(schema.reservations.carModelId, id)),
  ]);
  if (carN > 0)
    return {
      ok: false,
      error: "Usuń najpierw egzemplarze tego modelu.",
    };
  if (resN > 0)
    return {
      ok: false,
      error:
        "Model ma powiązane rezerwacje — ukryj go (odznacz „Opublikowany”) zamiast usuwać.",
    };

  try {
    await db.delete(schema.carModels).where(eq(schema.carModels.id, id));
  } catch (err) {
    if (isFkInUse(err))
      return { ok: false, error: "Model jest w użyciu i nie może zostać usunięty." };
    console.error("deleteModel failed:", err);
    return { ok: false, error: "Wystąpił błąd. Spróbuj ponownie." };
  }

  await recordAudit({
    adminId: admin.id,
    action: "fleet.model.delete",
    entity: "car_model",
    entityId: id,
  });
  revalidatePath("/admin/fleet");
  redirect("/admin/fleet");
}

// ── Cars (physical units) ────────────────────────────────────────────────────

export async function createCar(
  _prev: FormResult | null,
  formData: FormData,
): Promise<FormResult> {
  const admin = await requireAdmin();
  const parsed = CarSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodError(parsed.error);
  const d = parsed.data;

  const db = getDb();
  try {
    const [row] = await db
      .insert(schema.cars)
      .values({
        modelId: d.modelId,
        plate: d.plate,
        vin: d.vin,
        mileageKm: d.mileageKm,
        status: d.status,
        registeredOn: d.registeredOn,
        insuranceExpiry: d.insuranceExpiry,
        inspectionExpiry: d.inspectionExpiry,
        notes: d.notes,
      })
      .returning({ id: schema.cars.id });

    await recordAudit({
      adminId: admin.id,
      action: "fleet.car.create",
      entity: "car",
      entityId: row.id,
      after: { plate: d.plate, vin: d.vin, status: d.status },
    });
    revalidatePath(`/admin/fleet/${d.modelId}`);
    return { ok: true };
  } catch (err) {
    if (isUnique(err))
      return { ok: false, error: "Rejestracja lub numer VIN już istnieje." };
    if (isFkInUse(err))
      return { ok: false, error: "Nieznany model." };
    console.error("createCar failed:", err);
    return { ok: false, error: "Wystąpił błąd. Spróbuj ponownie." };
  }
}

export async function updateCar(
  _prev: FormResult | null,
  formData: FormData,
): Promise<FormResult> {
  const admin = await requireAdmin();
  const id = String(formData.get("id") ?? "");
  if (!UUID_RE.test(id)) return { ok: false, error: "Nieprawidłowe dane." };
  const parsed = CarSchema.safeParse(Object.fromEntries(formData));
  if (!parsed.success) return zodError(parsed.error);
  const d = parsed.data;

  const db = getDb();
  try {
    const [before] = await db
      .select()
      .from(schema.cars)
      .where(eq(schema.cars.id, id))
      .limit(1);
    if (!before) return { ok: false, error: "Nie znaleziono egzemplarza." };

    await db
      .update(schema.cars)
      .set({
        plate: d.plate,
        vin: d.vin,
        mileageKm: d.mileageKm,
        status: d.status,
        registeredOn: d.registeredOn,
        insuranceExpiry: d.insuranceExpiry,
        inspectionExpiry: d.inspectionExpiry,
        notes: d.notes,
        updatedAt: new Date(),
      })
      .where(eq(schema.cars.id, id));

    await recordAudit({
      adminId: admin.id,
      action: "fleet.car.update",
      entity: "car",
      entityId: id,
      before: { plate: before.plate, status: before.status },
      after: { plate: d.plate, status: d.status },
    });
    revalidatePath(`/admin/fleet/${d.modelId}`);
    return { ok: true };
  } catch (err) {
    if (isUnique(err))
      return { ok: false, error: "Rejestracja lub numer VIN już istnieje." };
    console.error("updateCar failed:", err);
    return { ok: false, error: "Wystąpił błąd. Spróbuj ponownie." };
  }
}

export async function deleteCar(id: string): Promise<FormResult> {
  const admin = await requireAdmin();
  if (!UUID_RE.test(id)) return { ok: false, error: "Nieprawidłowe dane." };
  const db = getDb();

  const [before] = await db
    .select({ modelId: schema.cars.modelId, plate: schema.cars.plate })
    .from(schema.cars)
    .where(eq(schema.cars.id, id))
    .limit(1);
  if (!before) return { ok: false, error: "Nie znaleziono egzemplarza." };

  const [{ res: resN }] = await db
    .select({ res: count() })
    .from(schema.reservations)
    .where(eq(schema.reservations.carId, id));
  if (resN > 0)
    return {
      ok: false,
      error:
        "Egzemplarz ma powiązane rezerwacje — ustaw status „Serwis” zamiast usuwać.",
    };

  try {
    await db.delete(schema.cars).where(eq(schema.cars.id, id));
  } catch (err) {
    if (isFkInUse(err))
      return { ok: false, error: "Egzemplarz jest w użyciu i nie może zostać usunięty." };
    console.error("deleteCar failed:", err);
    return { ok: false, error: "Wystąpił błąd. Spróbuj ponownie." };
  }

  await recordAudit({
    adminId: admin.id,
    action: "fleet.car.delete",
    entity: "car",
    entityId: id,
    before: { plate: before.plate },
  });
  revalidatePath(`/admin/fleet/${before.modelId}`);
  return { ok: true };
}
