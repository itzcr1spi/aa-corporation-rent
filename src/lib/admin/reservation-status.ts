// Pure reservation-status logic — safe to import from client components (no DB).

export type ReservationStatus =
  | "pending"
  | "confirmed"
  | "cancelled"
  | "completed"
  | "rejected";

/** Server-enforced status state machine. Any transition not listed is rejected. */
export const STATUS_TRANSITIONS: Record<ReservationStatus, ReservationStatus[]> =
  {
    pending: ["confirmed", "rejected", "cancelled"],
    confirmed: ["completed", "cancelled"],
    rejected: [],
    cancelled: [],
    completed: [],
  };

export function canTransition(from: ReservationStatus, to: ReservationStatus) {
  return STATUS_TRANSITIONS[from]?.includes(to) ?? false;
}

/** Polish labels (admin UI is Polish). */
export const STATUS_LABEL: Record<ReservationStatus, string> = {
  pending: "Oczekująca",
  confirmed: "Potwierdzona",
  cancelled: "Anulowana",
  completed: "Zakończona",
  rejected: "Odrzucona",
};

export const ACTION_LABEL: Record<ReservationStatus, string> = {
  confirmed: "Potwierdź",
  rejected: "Odrzuć",
  cancelled: "Anuluj",
  completed: "Zakończ",
  pending: "Oczekująca",
};
