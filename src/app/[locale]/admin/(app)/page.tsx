import { setRequestLocale } from "next-intl/server";
import { auth } from "@/lib/auth/config";
import { getDashboardStats, listReservations } from "@/lib/admin/reservations";
import { Link } from "@/i18n/navigation";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { type ReservationStatus } from "@/lib/admin/reservation-status";
import { formatPln, formatDatePl } from "@/lib/format";

export default async function AdminDashboard({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const [session, stats, pending] = await Promise.all([
    auth(),
    getDashboardStats(),
    listReservations({ status: "pending", page: 1 }),
  ]);

  const cards = [
    { label: "Rezerwacje", value: stats.total, href: "/admin/reservations" },
    {
      label: "Do potwierdzenia",
      value: stats.pending,
      href: "/admin/reservations?status=pending",
    },
    {
      label: "Potwierdzone",
      value: stats.confirmed,
      href: "/admin/reservations?status=confirmed",
    },
    { label: "Auta w serwisie", value: stats.carsInService, href: "/admin/fleet" },
  ];

  return (
    <div>
      <h1 className="font-heading text-3xl font-bold">Pulpit</h1>
      <p className="mt-2 text-sm text-ink-muted">
        Witaj, {session?.user?.name}.
      </p>

      <div className="mt-10 grid gap-px border border-line bg-line sm:grid-cols-2 lg:grid-cols-4">
        {cards.map((c) => (
          <Link
            key={c.label}
            href={c.href}
            className="group bg-void p-6 transition-colors hover:bg-graphite/60"
          >
            <p className="label-tight text-[10px] text-ink-faint">{c.label}</p>
            <p className="mt-3 font-heading text-3xl font-bold text-white">
              {c.value}
            </p>
          </Link>
        ))}
      </div>

      <section className="mt-12">
        <div className="mb-4 flex items-center justify-between">
          <h2 className="label text-xs text-ink-faint">Oczekujące na decyzję</h2>
          <Link
            href="/admin/reservations?status=pending"
            className="label-tight text-[10px] text-silver transition-colors hover:text-white"
          >
            Zobacz wszystkie →
          </Link>
        </div>

        {pending.items.length === 0 ? (
          <p className="border border-line bg-graphite/40 p-8 text-center text-sm text-silver">
            Brak rezerwacji oczekujących na potwierdzenie.
          </p>
        ) : (
          <ul className="divide-y divide-line border border-line">
            {pending.items.slice(0, 6).map((r) => (
              <li key={r.id}>
                <Link
                  href={`/admin/reservations/${r.id}`}
                  className="flex flex-wrap items-center justify-between gap-3 p-4 transition-colors hover:bg-white/5"
                >
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm text-white">
                      {r.reference}
                    </span>
                    <StatusBadge status={r.status as ReservationStatus} />
                  </div>
                  <div className="text-sm text-silver">
                    {r.brand} {r.model}
                  </div>
                  <div className="whitespace-nowrap text-sm text-ink-faint">
                    {formatDatePl(r.startDate)} – {formatDatePl(r.endDate)}
                  </div>
                  <div className="whitespace-nowrap text-sm text-white">
                    {formatPln(r.totalGrosze, locale)}
                  </div>
                </Link>
              </li>
            ))}
          </ul>
        )}
      </section>
    </div>
  );
}
