"use client";

import { useActionState } from "react";
import {
  updateModelPricing,
  updateFee,
  updatePickupLocation,
  type SaveResult,
} from "./actions";
import type {
  PricingModel,
  PricingFee,
  PricingLocation,
} from "@/lib/admin/pricing";

/** integer grosze → editable złoty string ("45000" → "450", "45050" → "450.5") */
function pln(grosze: number): string {
  return (grosze / 100).toString();
}

function Field({
  label,
  name,
  defaultValue,
  step = "0.01",
  suffix,
}: {
  label: string;
  name: string;
  defaultValue: string | number;
  step?: string;
  suffix?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className="label-tight text-[10px] text-ink-faint">{label}</span>
      <span className="flex items-center gap-1">
        <input
          type="number"
          name={name}
          defaultValue={defaultValue}
          step={step}
          min="0"
          className="h-10 w-24 border border-line-strong bg-black px-2 text-sm text-white"
        />
        {suffix && <span className="text-xs text-ink-faint">{suffix}</span>}
      </span>
    </label>
  );
}

function SaveBar({
  state,
  pending,
}: {
  state: SaveResult | null;
  pending: boolean;
}) {
  return (
    <div className="flex items-center gap-3">
      <button
        type="submit"
        disabled={pending}
        className="label inline-flex h-10 items-center border border-line-strong px-5 text-xs text-white transition-colors hover:border-white hover:bg-white/5 disabled:opacity-50"
      >
        {pending ? "Zapisywanie…" : "Zapisz"}
      </button>
      {state?.ok && <span className="text-xs text-emerald-400">Zapisano ✓</span>}
      {state && !state.ok && (
        <span className="text-xs text-red">{state.error}</span>
      )}
    </div>
  );
}

const FEE_LABEL: Record<string, string> = {
  extra_driver: "Dodatkowy kierowca",
  child_seat: "Fotelik dziecięcy",
  protection_package: "Pakiet ochronny",
  no_deposit: "Zniesienie kaucji",
};

export function ModelPriceRow({ model }: { model: PricingModel }) {
  const [state, action, pending] = useActionState(updateModelPricing, null);
  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-4 border-b border-line/60 py-4 last:border-0"
    >
      <input type="hidden" name="id" value={model.id} />
      <div className="min-w-40 flex-1">
        <p className="text-sm text-white">
          {model.brand} {model.model}
        </p>
        <p className="text-xs text-ink-faint">{model.year}</p>
      </div>
      <Field label="Doba" name="daily" defaultValue={pln(model.dailyPriceGrosze)} suffix="zł" />
      <Field
        label="Miesiąc"
        name="monthly"
        defaultValue={pln(model.monthlyPriceGrosze)}
        suffix="zł"
      />
      <Field
        label="Kaucja"
        name="deposit"
        defaultValue={pln(model.depositGrosze)}
        suffix="zł"
      />
      <Field
        label="Limit km/dobę"
        name="kmPerDay"
        defaultValue={model.kmPerDayLimit}
        step="1"
        suffix="0 = ∞"
      />
      <SaveBar state={state} pending={pending} />
    </form>
  );
}

export function FeeRow({ fee }: { fee: PricingFee }) {
  const [state, action, pending] = useActionState(updateFee, null);
  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-4 border-b border-line/60 py-4 last:border-0"
    >
      <input type="hidden" name="id" value={fee.id} />
      <div className="min-w-40 flex-1">
        <p className="text-sm text-white">{FEE_LABEL[fee.code] ?? fee.code}</p>
        <p className="font-mono text-xs text-ink-faint">{fee.code}</p>
      </div>
      <Field label="Kwota" name="amount" defaultValue={pln(fee.amountGrosze)} suffix="zł" />
      <label className="flex flex-col gap-1">
        <span className="label-tight text-[10px] text-ink-faint">Naliczanie</span>
        <select
          name="unit"
          defaultValue={fee.unit}
          className="h-10 border border-line-strong bg-black px-2 text-sm text-white"
        >
          <option value="per_rental">za najem</option>
          <option value="per_day">za dobę</option>
        </select>
      </label>
      <label className="flex h-10 items-center gap-2 self-end">
        <input
          type="checkbox"
          name="active"
          defaultChecked={fee.active}
          className="size-4 accent-red"
        />
        <span className="text-xs text-silver">Aktywna</span>
      </label>
      <SaveBar state={state} pending={pending} />
    </form>
  );
}

export function LocationRow({ location }: { location: PricingLocation }) {
  const [state, action, pending] = useActionState(updatePickupLocation, null);
  return (
    <form
      action={action}
      className="flex flex-wrap items-end gap-4 border-b border-line/60 py-4 last:border-0"
    >
      <input type="hidden" name="id" value={location.id} />
      <div className="min-w-40 flex-1">
        <p className="text-sm text-white">{location.name}</p>
        <p className="font-mono text-xs text-ink-faint">{location.slug}</p>
      </div>
      <Field label="Opłata" name="fee" defaultValue={pln(location.feeGrosze)} suffix="zł" />
      <label className="flex h-10 items-center gap-2 self-end">
        <input
          type="checkbox"
          name="active"
          defaultChecked={location.active}
          className="size-4 accent-red"
        />
        <span className="text-xs text-silver">Aktywna</span>
      </label>
      <SaveBar state={state} pending={pending} />
    </form>
  );
}
