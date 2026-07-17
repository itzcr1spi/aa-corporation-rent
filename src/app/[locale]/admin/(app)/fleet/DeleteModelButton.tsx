"use client";

import { useState, useTransition } from "react";
import { deleteModel } from "./actions";

export function DeleteModelButton({ id }: { id: string }) {
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [confirm, setConfirm] = useState(false);

  const doDelete = () => {
    setError(null);
    start(async () => {
      const res = await deleteModel(id);
      if (!res.ok) {
        setError(res.error);
        setConfirm(false);
      }
      // success redirects to /admin/fleet
    });
  };

  return (
    <div>
      <div className="flex flex-wrap items-center gap-3">
        {confirm ? (
          <>
            <span className="text-sm text-silver">
              Usunąć ten model bezpowrotnie?
            </span>
            <button
              type="button"
              onClick={doDelete}
              disabled={pending}
              className="label inline-flex h-10 items-center border border-red px-5 text-xs text-red transition-colors hover:bg-red hover:text-white disabled:opacity-50"
            >
              {pending ? "Usuwanie…" : "Tak, usuń model"}
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
            className="label inline-flex h-10 items-center border border-line-strong px-5 text-xs text-ink-faint transition-colors hover:border-red hover:text-red"
          >
            Usuń model
          </button>
        )}
      </div>
      {error && <p className="mt-3 text-sm text-red">{error}</p>}
    </div>
  );
}
