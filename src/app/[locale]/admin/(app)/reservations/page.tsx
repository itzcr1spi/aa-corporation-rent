import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listReservations } from "@/lib/admin/reservations";
import {
  STATUS_LABEL,
  type ReservationStatus,
} from "@/lib/admin/reservation-status";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { formatPln, formatDatePl } from "@/lib/format";

const STATUSES: ReservationStatus[] = [
  "pending",
  "confirmed",
  "completed",
  "cancelled",
  "rejected",
];

function asStatus(v: unknown): ReservationStatus | undefined {
  return typeof v === "string" && STATUSES.includes(v as ReservationStatus)
    ? (v as ReservationStatus)
    : undefined;
}

export default async function ReservationsPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const status = asStatus(sp.status);
  const q = typeof sp.q === "string" && sp.q.trim() ? sp.q.trim() : undefined;
  const page = Math.max(1, Number(sp.page) || 1);

  const { items, total, pageSize } = await listReservations({
    status,
    q,
    page,
  });
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const pageHref = (n: number) => {
    const p = new URLSearchParams();
    if (status) p.set("status", status);
    if (q) p.set("q", q);
    if (n > 1) p.set("page", String(n));
    const s = p.toString();
    return `/admin/reservations${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">Rezerwacje</h1>
          <p className="mt-1 text-sm text-silver">
            {total} {total === 1 ? "rezerwacja" : "rezerwacji"} łącznie
          </p>
        </div>
      </header>

      <form
        method="get"
        className="mb-6 flex flex-wrap items-end gap-3 border border-line bg-graphite/40 p-4"
      >
        <label className="flex flex-col gap-1">
          <span className="label-tight text-[10px] text-ink-faint">Status</span>
          <select
            name="status"
            defaultValue={status ?? ""}
            className="h-11 border border-line-strong bg-black px-3 text-sm text-white"
          >
            <option value="">Wszystkie</option>
            {STATUSES.map((s) => (
              <option key={s} value={s}>
                {STATUS_LABEL[s]}
              </option>
            ))}
          </select>
        </label>
        <label className="flex flex-1 flex-col gap-1">
          <span className="label-tight text-[10px] text-ink-faint">Szukaj</span>
          <input
            type="text"
            name="q"
            defaultValue={q ?? ""}
            placeholder="Numer, nazwisko lub e-mail"
            className="h-11 min-w-48 border border-line-strong bg-black px-3 text-sm text-white placeholder:text-ink-faint"
          />
        </label>
        <button
          type="submit"
          className="label inline-flex h-11 items-center border border-line-strong px-6 text-xs text-white transition-colors hover:border-white hover:bg-white/5"
        >
          Filtruj
        </button>
        {(status || q) && (
          <Link
            href="/admin/reservations"
            className="label inline-flex h-11 items-center px-3 text-xs text-ink-faint transition-colors hover:text-white"
          >
            Wyczyść
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <p className="border border-line bg-graphite/40 p-10 text-center text-sm text-silver">
          Brak rezerwacji dla wybranych filtrów.
        </p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-graphite/60 text-left">
                <Th>Numer</Th>
                <Th>Auto</Th>
                <Th>Termin</Th>
                <Th>Klient</Th>
                <Th className="text-right">Kwota</Th>
                <Th>Status</Th>
              </tr>
            </thead>
            <tbody>
              {items.map((r) => (
                <tr
                  key={r.id}
                  className="border-b border-line/60 transition-colors last:border-0 hover:bg-white/5"
                >
                  <Td>
                    <Link
                      href={`/admin/reservations/${r.id}`}
                      className="font-mono text-white underline-offset-4 hover:underline"
                    >
                      {r.reference}
                    </Link>
                  </Td>
                  <Td>
                    <span className="text-white">
                      {r.brand} {r.model}
                    </span>
                    {r.plate && (
                      <span className="ml-2 text-ink-faint">{r.plate}</span>
                    )}
                  </Td>
                  <Td className="whitespace-nowrap text-silver">
                    {formatDatePl(r.startDate)} – {formatDatePl(r.endDate)}
                  </Td>
                  <Td className="text-silver">{r.customerName}</Td>
                  <Td className="whitespace-nowrap text-right text-white">
                    {formatPln(r.totalGrosze, locale)}
                  </Td>
                  <Td>
                    <StatusBadge status={r.status as ReservationStatus} />
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-between text-sm">
          <PageLink href={pageHref(page - 1)} disabled={page <= 1}>
            ← Poprzednia
          </PageLink>
          <span className="text-ink-faint">
            Strona {page} z {pages}
          </span>
          <PageLink href={pageHref(page + 1)} disabled={page >= pages}>
            Następna →
          </PageLink>
        </nav>
      )}
    </div>
  );
}

function Th({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <th
      className={`label-tight px-4 py-3 text-[10px] font-normal text-ink-faint ${className}`}
    >
      {children}
    </th>
  );
}

function Td({
  children,
  className = "",
}: {
  children: React.ReactNode;
  className?: string;
}) {
  return <td className={`px-4 py-3 align-middle ${className}`}>{children}</td>;
}

function PageLink({
  href,
  disabled,
  children,
}: {
  href: string;
  disabled: boolean;
  children: React.ReactNode;
}) {
  if (disabled) {
    return <span className="text-ink-faint opacity-40">{children}</span>;
  }
  return (
    <Link
      href={href}
      className="text-silver underline-offset-4 transition-colors hover:text-white hover:underline"
    >
      {children}
    </Link>
  );
}
