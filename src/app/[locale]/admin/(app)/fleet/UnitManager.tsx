"use client";

import { useActionState, useState, useTransition } from "react";
import { createCar, updateCar, deleteCar, type FormResult } from "./actions";
import type { FleetUnit } from "@/lib/admin/fleet";
import {
  CAR_STATUSES,
  CAR_STATUS_LABEL,
} from "@/lib/admin/fleet-options";

const inputCls =
  "h-10 w-full border border-line-strong bg-black px-3 text-sm text-white placeholder:text-ink-faint";
const labelCls = "label-tight text-[10px] text-ink-faint";

function UnitFields({ unit }: { unit?: FleetUnit }) {
  return (
    <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      <label className="flex flex-col gap-1">
        <span className={labelCls}>Rejestracja *</span>
        <input name="plate" defaultValue={unit?.plate} required placeholder="WA 12345" className={inputCls} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelCls}>VIN *</span>
        <input name="vin" defaultValue={unit?.vin} required placeholder="WBA…" className={`${inputCls} font-mono`} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelCls}>Przebieg (km)</span>
        <input name="mileageKm" type="number" min="0" defaultValue={unit?.mileageKm ?? 0} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelCls}>Status</span>
        <select name="status" defaultValue={unit?.status ?? "available"} className={inputCls}>
          {CAR_STATUSES.map((s) => (
            <option key={s} value={s}>
              {CAR_STATUS_LABEL[s]}
            </option>
          ))}
        </select>
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelCls}>Data rejestracji</span>
        <input name="registeredOn" type="date" defaultValue={unit?.registeredOn ?? ""} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelCls}>Ważność OC/AC</span>
        <input name="insuranceExpiry" type="date" defaultValue={unit?.insuranceExpiry ?? ""} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1">
        <span className={labelCls}>Ważność przeglądu</span>
        <input name="inspectionExpiry" type="date" defaultValue={unit?.inspectionExpiry ?? ""} className={inputCls} />
      </label>
      <label className="flex flex-col gap-1 lg:col-span-1">
        <span className={labelCls}>Notatki</span>
        <input name="notes" defaultValue={unit?.notes ?? ""} className={inputCls} />
      </label>
    </div>
  );
}

function Feedback({ state }: { state: FormResult | null }) {
  if (!state) return null;
  if (state.ok) return <span className="text-xs text-emerald-400">Zapisano ✓</span>;
  return <span className="text-xs text-red">{state.error}</span>;
}

export function UnitRow({ unit }: { unit: FleetUnit }) {
  const [state, action, pending] = useActionState(updateCar, null);
  const [deleting, startDelete] = useTransition();
  const [delError, setDelError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const doDelete = () => {
    setDelError(null);
    startDelete(async () => {
      const res = await deleteCar(unit.id);
      if (!res.ok) {
        setDelError(res.error);
        setConfirm(false);
      }
      // on success the row is revalidated away by the server
    });
  };

  return (
    <form action={action} className="border-b border-line/60 py-5 last:border-0">
      <input type="hidden" name="id" value={unit.id} />
      <input type="hidden" name="modelId" value={unit.modelId} />
      <UnitFields unit={unit} />
      <div className="mt-3 flex flex-wrap items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="label inline-flex h-9 items-center border border-line-strong px-4 text-xs text-white transition-colors hover:border-white hover:bg-white/5 disabled:opacity-50"
        >
          {pending ? "Zapisywanie…" : "Zapisz"}
        </button>
        {confirm ? (
          <>
            <span className="text-xs text-silver">Na pewno?</span>
            <button
              type="button"
              onClick={doDelete}
              disabled={deleting}
              className="label inline-flex h-9 items-center border border-red px-4 text-xs text-red transition-colors hover:bg-red hover:text-white disabled:opacity-50"
            >
              {deleting ? "Usuwanie…" : "Tak, usuń"}
            </button>
            <button
              type="button"
              onClick={() => setConfirm(false)}
              className="text-xs text-ink-faint hover:text-white"
            >
              Anuluj
            </button>
          </>
        ) : (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="label inline-flex h-9 items-center px-2 text-xs text-ink-faint transition-colors hover:text-red"
          >
            Usuń
          </button>
        )}
        <Feedback state={state} />
        {delError && <span className="text-xs text-red">{delError}</span>}
      </div>
    </form>
  );
}

export function AddUnit({ modelId }: { modelId: string }) {
  const [state, action, pending] = useActionState(createCar, null);
  const [open, setOpen] = useState(false);

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="label inline-flex h-10 items-center border border-line-strong px-5 text-xs text-white transition-colors hover:border-white hover:bg-white/5"
      >
        + Dodaj egzemplarz
      </button>
    );
  }

  return (
    <form
      action={action}
      className="border border-line-strong bg-graphite/60 p-5"
    >
      <input type="hidden" name="modelId" value={modelId} />
      <p className="label mb-4 text-xs text-white">Nowy egzemplarz</p>
      <UnitFields />
      <div className="mt-4 flex items-center gap-3">
        <button
          type="submit"
          disabled={pending}
          className="label inline-flex h-9 items-center bg-red px-5 text-xs text-white transition-colors hover:bg-red-hover disabled:opacity-50"
        >
          {pending ? "Dodawanie…" : "Dodaj"}
        </button>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="text-xs text-ink-faint hover:text-white"
        >
          Anuluj
        </button>
        <Feedback state={state} />
      </div>
    </form>
  );
}
