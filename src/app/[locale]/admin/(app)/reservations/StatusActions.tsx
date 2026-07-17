"use client";

import { useState, useTransition } from "react";
import { useRouter } from "next/navigation";
import { updateReservationStatus } from "./actions";
import {
  ACTION_LABEL,
  STATUS_TRANSITIONS,
  type ReservationStatus,
} from "@/lib/admin/reservation-status";
import { cn } from "@/lib/utils";

const ERR: Record<string, string> = {
  overlap:
    "Termin nakłada się na istniejącą potwierdzoną rezerwację tego auta.",
  illegal: "Niedozwolona zmiana statusu.",
  not_found: "Nie znaleziono rezerwacji.",
  invalid: "Nieprawidłowe dane.",
  server: "Wystąpił błąd. Spróbuj ponownie.",
};

export function StatusActions({
  id,
  status,
}: {
  id: string;
  status: ReservationStatus;
}) {
  const router = useRouter();
  const [pending, start] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const allowed = STATUS_TRANSITIONS[status];

  if (allowed.length === 0) return null;

  const act = (to: ReservationStatus) => {
    setError(null);
    start(async () => {
      const res = await updateReservationStatus({ id, to });
      if (!res.ok) setError(ERR[res.error] ?? ERR.server);
      else router.refresh();
    });
  };

  return (
    <div>
      <div className="flex flex-wrap gap-3">
        {allowed.map((to) => (
          <button
            key={to}
            type="button"
            disabled={pending}
            onClick={() => act(to)}
            className={cn(
              "label inline-flex h-11 items-center justify-center px-6 text-xs transition-colors disabled:opacity-50",
              to === "confirmed"
                ? "bg-red text-white hover:bg-red-hover"
                : "border border-line-strong text-white hover:border-white hover:bg-white/5",
            )}
          >
            {ACTION_LABEL[to]}
          </button>
        ))}
      </div>
      {error && <p className="mt-3 text-xs text-red">{error}</p>}
    </div>
  );
}
