"use client";

import { useMemo, useState, useTransition, type ReactNode } from "react";
import { useLocale, useTranslations } from "next-intl";
import { computeQuote, rentalDays } from "@/lib/booking/pricing";
import { createReservation, type ReserveResult } from "@/lib/booking/actions";
import { formatPln } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FleetCar } from "@/lib/fleet/types";
import type { DepositVariant, FeeCatalog } from "@/lib/booking/types";
import type { LocationOption } from "@/lib/booking/fees";

const inputCls =
  "w-full rounded-none border border-line bg-surface-1 px-3 py-2.5 text-sm text-white outline-none transition-colors focus:border-line-strong [color-scheme:dark]";

function todayIso(): string {
  const d = new Date();
  return `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
}

function Field({
  label,
  error,
  children,
  className,
}: {
  label: string;
  error?: string;
  children: ReactNode;
  className?: string;
}) {
  return (
    <label className={cn("block", className)}>
      <span className="label-tight text-[10px] text-ink-faint">{label}</span>
      <span className="mt-2 block">{children}</span>
      {error && <span className="mt-1 block text-[11px] text-red">{error}</span>}
    </label>
  );
}

function Toggle({
  checked,
  onChange,
  label,
  price,
}: {
  checked: boolean;
  onChange: (v: boolean) => void;
  label: string;
  price: string;
}) {
  return (
    <button
      type="button"
      onClick={() => onChange(!checked)}
      className="flex w-full items-center justify-between border-b border-line py-3 text-left"
    >
      <span className="flex items-center gap-3">
        <span
          className={cn(
            "flex h-4 w-4 items-center justify-center border transition-colors",
            checked ? "border-red bg-red" : "border-line-strong",
          )}
        >
          {checked && (
            <svg width="10" height="10" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <path d="M5 12l5 5 9-11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
            </svg>
          )}
        </span>
        <span className="text-sm text-white">{label}</span>
      </span>
      <span className="label-tight text-[11px] text-ink-muted">{price}</span>
    </button>
  );
}

export function BookingPanel({
  car,
  locations,
  fees,
}: {
  car: FleetCar;
  locations: LocationOption[];
  fees: FeeCatalog;
}) {
  const t = useTranslations("Booking");
  const tf = useTranslations("Fleet");
  const locale = useLocale();
  const today = todayIso();

  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [locationSlug, setLocationSlug] = useState(locations[0]?.slug ?? "office");
  const [extraDriver, setExtraDriver] = useState(false);
  const [childSeat, setChildSeat] = useState(false);
  const [protectionPackage, setProtectionPackage] = useState(false);
  const [depositVariant, setDepositVariant] = useState<DepositVariant>("with_deposit");
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [phone, setPhone] = useState("");
  const [pending, startTransition] = useTransition();
  const [result, setResult] = useState<ReserveResult | null>(null);

  const validRange = Boolean(
    startDate && endDate && endDate >= startDate && startDate >= today,
  );
  const days = validRange ? rentalDays(new Date(startDate), new Date(endDate)) : 0;
  const loc = locations.find((l) => l.slug === locationSlug);

  const quote = useMemo(
    () =>
      computeQuote({
        dailyPriceGrosze: car.dailyPriceGrosze,
        depositGrosze: car.depositGrosze,
        days: Math.max(1, days),
        locationFeeGrosze: loc?.feeGrosze ?? 0,
        extras: { extraDriver, childSeat, protectionPackage },
        depositVariant,
        fees,
      }),
    [car, days, loc, extraDriver, childSeat, protectionPackage, depositVariant, fees],
  );

  const fieldErrors = result && !result.ok ? (result.fieldErrors ?? {}) : {};
  const fErr = (k: string) =>
    fieldErrors[k] ? t(`errors.${fieldErrors[k]}` as never) : undefined;

  const feePrice = (f: { amountGrosze: number; unit: string }) =>
    `+${formatPln(f.amountGrosze, locale)}${f.unit === "per_day" ? ` / ${tf("perDay")}` : ""}`;

  function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    setResult(null);
    startTransition(async () => {
      const res = await createReservation({
        modelSlug: car.slug,
        startDate,
        endDate,
        locationSlug,
        extraDriver,
        childSeat,
        protectionPackage,
        depositVariant,
        customerName: name,
        customerEmail: email,
        customerPhone: phone,
      });
      setResult(res);
    });
  }

  if (result?.ok) {
    return (
      <div className="border border-line p-7 text-center">
        <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-pill bg-red">
          <svg width="22" height="22" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <path d="M5 12l5 5 9-11" stroke="#fff" strokeWidth="2.5" strokeLinecap="round" strokeLinejoin="round" />
          </svg>
        </div>
        <h2 className="mt-5 font-heading text-xl font-bold">{t("successTitle")}</h2>
        <p className="mt-3 text-sm text-ink-muted">
          {t("successBody", { ref: result.reference })}
        </p>
        <button
          type="button"
          onClick={() => {
            setResult(null);
            setStartDate("");
            setEndDate("");
          }}
          className="label mt-6 text-[11px] text-silver hover:text-white"
        >
          {t("newBooking")}
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="border border-line p-6 md:p-7">
      <h2 className="font-heading text-xl font-bold">{t("title")}</h2>

      <div className="mt-6 grid grid-cols-2 gap-3">
        <Field label={t("startDate")} error={fErr("startDate")}>
          <input
            type="date"
            min={today}
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
            className={inputCls}
            required
          />
        </Field>
        <Field label={t("endDate")} error={fErr("endDate")}>
          <input
            type="date"
            min={startDate || today}
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
            className={inputCls}
            required
          />
        </Field>
      </div>

      <Field label={t("location")} className="mt-4">
        <select
          value={locationSlug}
          onChange={(e) => setLocationSlug(e.target.value)}
          className={inputCls}
        >
          {locations.map((l) => (
            <option key={l.slug} value={l.slug}>
              {(locale === "en" ? l.nameEn : l.name) +
                (l.feeGrosze > 0 ? ` (+${formatPln(l.feeGrosze, locale)})` : "")}
            </option>
          ))}
        </select>
      </Field>

      <fieldset className="mt-6">
        <legend className="label-tight text-[10px] text-ink-faint">{t("extras")}</legend>
        <div className="mt-2 border-t border-line">
          <Toggle checked={extraDriver} onChange={setExtraDriver} label={t("extraDriver")} price={feePrice(fees.extraDriver)} />
          <Toggle checked={childSeat} onChange={setChildSeat} label={t("childSeat")} price={feePrice(fees.childSeat)} />
          <Toggle checked={protectionPackage} onChange={setProtectionPackage} label={t("protectionPackage")} price={feePrice(fees.protectionPackage)} />
        </div>
      </fieldset>

      <div className="mt-6">
        <p className="label-tight text-[10px] text-ink-faint">{t("depositTitle")}</p>
        <div className="mt-2 grid grid-cols-2 gap-2">
          {(["with_deposit", "no_deposit"] as const).map((v) => (
            <button
              key={v}
              type="button"
              onClick={() => setDepositVariant(v)}
              className={cn(
                "label-tight border px-3 py-2.5 text-[11px] transition-colors",
                depositVariant === v
                  ? "border-red text-white"
                  : "border-line text-ink-muted hover:border-line-strong",
              )}
            >
              {v === "with_deposit" ? t("withDeposit") : t("noDeposit")}
            </button>
          ))}
        </div>
      </div>

      {/* Live, but preview-only — the server recomputes the authoritative total. */}
      <div className="mt-6 space-y-2 border-t border-line pt-5 text-sm">
        <div className="flex justify-between">
          <span className="text-ink-muted">
            {t("rental")} · {t("days", { days: Math.max(1, days) })}
          </span>
          <span className="text-white">{formatPln(quote.rentalGrosze, locale)}</span>
        </div>
        {quote.lines.map((l) => (
          <div key={l.code} className="flex justify-between">
            <span className="text-ink-muted">{t(`lineLabels.${l.code}` as never)}</span>
            <span className="text-white">{formatPln(l.amountGrosze, locale)}</span>
          </div>
        ))}
        <div className="flex justify-between border-t border-line pt-3 font-heading text-base font-bold">
          <span>{t("total")}</span>
          <span>{formatPln(quote.totalGrosze, locale)}</span>
        </div>
        {quote.depositGrosze > 0 && (
          <div className="flex justify-between text-xs text-ink-faint">
            <span>{t("depositHeld")}</span>
            <span>{formatPln(quote.depositGrosze, locale)}</span>
          </div>
        )}
      </div>

      <fieldset className="mt-6 space-y-3">
        <legend className="label-tight text-[10px] text-ink-faint">{t("contact")}</legend>
        <Field label={t("name")} error={fErr("customerName")}>
          <input value={name} onChange={(e) => setName(e.target.value)} className={inputCls} required autoComplete="name" />
        </Field>
        <Field label={t("email")} error={fErr("customerEmail")}>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} className={inputCls} required autoComplete="email" />
        </Field>
        <Field label={t("phone")} error={fErr("customerPhone")}>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} className={inputCls} required autoComplete="tel" />
        </Field>
      </fieldset>

      {result && !result.ok && (
        <p className="mt-4 text-xs text-red">{t(`errors.${result.error}` as never)}</p>
      )}

      <button
        type="submit"
        disabled={pending || !validRange}
        className="label mt-6 inline-flex h-14 w-full items-center justify-center bg-red text-sm text-white transition-colors hover:bg-red-hover disabled:cursor-not-allowed disabled:opacity-50"
      >
        {pending ? t("submitting") : t("submit")}
      </button>
      <p className="mt-3 text-[10px] leading-relaxed text-ink-faint">{t("note")}</p>
    </form>
  );
}
