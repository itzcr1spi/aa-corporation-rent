import {
  STATUS_LABEL,
  type ReservationStatus,
} from "@/lib/admin/reservation-status";
import { cn } from "@/lib/utils";

const STYLES: Record<ReservationStatus, string> = {
  pending: "border-line-strong text-silver",
  confirmed: "border-red text-white",
  completed: "border-line text-silver",
  cancelled: "border-line text-ink-faint",
  rejected: "border-line text-red",
};

export function StatusBadge({ status }: { status: ReservationStatus }) {
  return (
    <span
      className={cn(
        "label-tight inline-block whitespace-nowrap border px-2 py-1 text-[10px]",
        STYLES[status],
      )}
    >
      {STATUS_LABEL[status]}
    </span>
  );
}
