"use client";

import { useActionState } from "react";
import type { FormResult } from "./actions";
import type { EditableModel } from "@/lib/admin/fleet";
import {
  CATEGORIES,
  GEARBOXES,
  FUELS,
  CATEGORY_LABEL,
  GEARBOX_LABEL,
  FUEL_LABEL,
} from "@/lib/admin/fleet-options";

type Action = (
  prev: FormResult | null,
  formData: FormData,
) => Promise<FormResult>;

function pln(grosze: number): string {
  return (grosze / 100).toString();
}

const inputCls =
  "h-10 w-full border border-line-strong bg-black px-3 text-sm text-white placeholder:text-ink-faint";
const labelCls = "label-tight text-[10px] text-ink-faint";

function Text({
  label,
  name,
  defaultValue,
  required,
  placeholder,
  type = "text",
  step,
  min,
}: {
  label: string;
  name: string;
  defaultValue?: string | number;
  required?: boolean;
  placeholder?: string;
  type?: string;
  step?: string;
  min?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelCls}>
        {label}
        {required && <span className="text-red"> *</span>}
      </span>
      <input
        type={type}
        name={name}
        defaultValue={defaultValue}
        required={required}
        placeholder={placeholder}
        step={step}
        min={min}
        className={inputCls}
      />
    </label>
  );
}

function Select({
  label,
  name,
  options,
  labels,
  defaultValue,
}: {
  label: string;
  name: string;
  options: readonly string[];
  labels: Record<string, string>;
  defaultValue?: string;
}) {
  return (
    <label className="flex flex-col gap-1">
      <span className={labelCls}>{label}</span>
      <select
        name={name}
        defaultValue={defaultValue}
        className={inputCls}
      >
        {options.map((o) => (
          <option key={o} value={o}>
            {labels[o]}
          </option>
        ))}
      </select>
    </label>
  );
}

export function ModelForm({
  action,
  model,
}: {
  action: Action;
  model?: EditableModel;
}) {
  const [state, formAction, pending] = useActionState(action, null);

  return (
    <form action={formAction} className="space-y-8">
      {model && <input type="hidden" name="id" value={model.id} />}

      <fieldset className="space-y-4">
        <legend className="label text-xs text-white">Podstawowe dane</legend>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Marka" name="brand" defaultValue={model?.brand} required placeholder="BMW" />
          <Text label="Model" name="model" defaultValue={model?.model} required placeholder="740d xDrive" />
          <Text
            label="Identyfikator URL (slug)"
            name="slug"
            defaultValue={model?.slug}
            required
            placeholder="bmw-740d"
          />
          <Text label="Rok" name="year" type="number" min="1990" defaultValue={model?.year} required placeholder="2024" />
          <Select
            label="Segment"
            name="category"
            options={CATEGORIES}
            labels={CATEGORY_LABEL}
            defaultValue={model?.category}
          />
          <Text label="Liczba miejsc" name="seats" type="number" min="1" defaultValue={model?.seats ?? 5} required />
          <Select
            label="Skrzynia biegów"
            name="gearbox"
            options={GEARBOXES}
            labels={GEARBOX_LABEL}
            defaultValue={model?.gearbox}
          />
          <Select
            label="Paliwo"
            name="fuel"
            options={FUELS}
            labels={FUEL_LABEL}
            defaultValue={model?.fuel}
          />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="label text-xs text-white">Cennik</legend>
        <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          <Text label="Cena / doba (zł)" name="daily" type="number" step="0.01" min="0" defaultValue={model ? pln(model.dailyPriceGrosze) : ""} required />
          <Text label="Cena / miesiąc (zł)" name="monthly" type="number" step="0.01" min="0" defaultValue={model ? pln(model.monthlyPriceGrosze) : ""} required />
          <Text label="Kaucja (zł)" name="deposit" type="number" step="0.01" min="0" defaultValue={model ? pln(model.depositGrosze) : "0"} />
          <Text label="Limit km / doba" name="kmPerDayLimit" type="number" min="0" defaultValue={model?.kmPerDayLimit ?? 0} />
        </div>
      </fieldset>

      <fieldset className="space-y-4">
        <legend className="label text-xs text-white">Prezentacja</legend>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Opis (PL)</span>
          <textarea
            name="descriptionPl"
            defaultValue={model?.descriptionPl ?? ""}
            rows={3}
            className="w-full border border-line-strong bg-black px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>Opis (EN)</span>
          <textarea
            name="descriptionEn"
            defaultValue={model?.descriptionEn ?? ""}
            rows={3}
            className="w-full border border-line-strong bg-black px-3 py-2 text-sm text-white"
          />
        </label>
        <label className="flex flex-col gap-1">
          <span className={labelCls}>
            Zdjęcia — ścieżki, po jednej w wierszu (np. /fleet/bmw-740d.jpg)
          </span>
          <textarea
            name="images"
            defaultValue={(model?.images ?? []).join("\n")}
            rows={3}
            placeholder="/fleet/bmw-740d.jpg"
            className="w-full border border-line-strong bg-black px-3 py-2 font-mono text-xs text-white"
          />
        </label>
        <div className="grid gap-4 sm:grid-cols-2">
          <Text label="Kolejność" name="sortOrder" type="number" min="0" defaultValue={model?.sortOrder ?? 0} />
          <label className="flex items-center gap-2 self-end pb-2">
            <input
              type="checkbox"
              name="published"
              defaultChecked={model?.published ?? true}
              className="size-4 accent-red"
            />
            <span className="text-sm text-silver">Opublikowany (widoczny publicznie)</span>
          </label>
        </div>
      </fieldset>

      <div className="flex items-center gap-4 border-t border-line pt-6">
        <button
          type="submit"
          disabled={pending}
          className="label inline-flex h-11 items-center bg-red px-8 text-xs text-white transition-colors hover:bg-red-hover disabled:opacity-50"
        >
          {pending ? "Zapisywanie…" : model ? "Zapisz zmiany" : "Utwórz model"}
        </button>
        {state && !state.ok && (
          <span className="text-sm text-red">{state.error}</span>
        )}
        {state?.ok && <span className="text-sm text-emerald-400">Zapisano ✓</span>}
      </div>
    </form>
  );
}
