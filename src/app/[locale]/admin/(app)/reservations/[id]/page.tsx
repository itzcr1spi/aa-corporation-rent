import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getReservation } from "@/lib/admin/reservations";
import { type ReservationStatus } from "@/lib/admin/reservation-status";
import { StatusBadge } from "@/components/admin/StatusBadge";
import { StatusActions } from "../StatusActions";
import { formatPln, formatDatePl, formatDateTimePl } from "@/lib/format";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

const LINE_LABEL: Record<string, string> = {
  location: "Odbiór poza siedzibą",
  extra_driver: "Dodatkowy kierowca",
  child_seat: "Fotelik dziecięcy",
  protection_package: "Pakiet ochronny",
  no_deposit: "Wariant bez kaucji",
};

export default async function ReservationDetailPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!UUID_RE.test(id)) notFound();
  const data = await getReservation(id);
  if (!data) notFound();

  const r = data.r;
  const status = r.status as ReservationStatus;

  return (
    <div className="mx-auto max-w-4xl">
      <Link
        href="/admin/reservations"
        className="label-tight text-[10px] text-ink-faint transition-colors hover:text-white"
      >
        ← Rezerwacje
      </Link>

      <header className="mt-4 mb-8 flex flex-wrap items-start justify-between gap-4">
        <div>
          <div className="flex items-center gap-3">
            <h1 className="font-mono text-2xl text-white">{r.reference}</h1>
            <StatusBadge status={status} />
          </div>
          <p className="mt-1 text-sm text-ink-faint">
            Złożona {formatDateTimePl(r.createdAt)}
          </p>
        </div>
      </header>

      <div className="mb-8 border border-line bg-graphite/40 p-6">
        <h2 className="label-tight mb-4 text-[10px] text-ink-faint">Działania</h2>
        <StatusActions id={r.id} status={status} />
        {status === "confirmed" && (
          <p className="mt-3 text-xs text-ink-faint">
            Termin tego auta jest teraz zablokowany w kalendarzu.
          </p>
        )}
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        <Panel title="Klient">
          <Row label="Imię i nazwisko" value={r.customerName} />
          <Row
            label="E-mail"
            value={
              <a
                href={`mailto:${r.customerEmail}`}
                className="text-white underline-offset-4 hover:underline"
              >
                {r.customerEmail}
              </a>
            }
          />
          <Row
            label="Telefon"
            value={
              <a
                href={`tel:${r.customerPhone}`}
                className="text-white underline-offset-4 hover:underline"
              >
                {r.customerPhone}
              </a>
            }
          />
          {r.dateOfBirth && (
            <Row label="Data urodzenia" value={formatDatePl(r.dateOfBirth)} />
          )}
          {r.licenceNumber && (
            <Row label="Nr prawa jazdy" value={r.licenceNumber} />
          )}
          {(r.addressStreet || r.addressCity) && (
            <Row
              label="Adres"
              value={
                <span>
                  {r.addressStreet}
                  {r.addressStreet && <br />}
                  {[r.addressPostcode, r.addressCity]
                    .filter(Boolean)
                    .join(" ")}
                </span>
              }
            />
          )}
        </Panel>

        <Panel title="Rezerwacja">
          <Row
            label="Auto"
            value={`${data.brand ?? ""} ${data.model ?? ""}`.trim() || "—"}
          />
          {data.plate && <Row label="Rejestracja" value={data.plate} />}
          <Row
            label="Termin"
            value={`${formatDatePl(r.startDate)} – ${formatDatePl(r.endDate)}`}
          />
          <Row label="Liczba dni" value={String(r.days)} />
          {data.locationName && (
            <Row label="Miejsce odbioru" value={data.locationName} />
          )}
          <Row
            label="Kaucja"
            value={
              r.depositVariant === "no_deposit"
                ? "Bez kaucji"
                : "Z kaucją zwrotną"
            }
          />
        </Panel>
      </div>

      <div className="mt-6 border border-line bg-graphite/40 p-6">
        <h2 className="label-tight mb-4 text-[10px] text-ink-faint">Wycena</h2>
        <dl className="space-y-2 text-sm">
          <PriceRow
            label={`Wynajem (${data.quote?.days ?? r.days} dni × ${formatPln(
              data.quote?.dailyPriceGrosze ?? 0,
              locale,
            )})`}
            value={formatPln(data.quote?.rentalGrosze ?? 0, locale)}
          />
          {data.quote?.lines.map((line) => (
            <PriceRow
              key={line.code}
              label={LINE_LABEL[line.code] ?? line.code}
              value={formatPln(line.amountGrosze, locale)}
            />
          ))}
          <div className="mt-3 flex items-center justify-between border-t border-line pt-3">
            <dt className="label text-xs text-white">Razem</dt>
            <dd className="font-display text-lg text-white">
              {formatPln(r.totalGrosze, locale)}
            </dd>
          </div>
          {r.depositGrosze > 0 && (
            <PriceRow
              label="Kaucja zwrotna (pobierana osobno)"
              value={formatPln(r.depositGrosze, locale)}
              muted
            />
          )}
        </dl>
      </div>
    </div>
  );
}

function Panel({
  title,
  children,
}: {
  title: string;
  children: React.ReactNode;
}) {
  return (
    <section className="border border-line bg-graphite/40 p-6">
      <h2 className="label-tight mb-4 text-[10px] text-ink-faint">{title}</h2>
      <dl className="space-y-3">{children}</dl>
    </section>
  );
}

function Row({
  label,
  value,
}: {
  label: string;
  value: React.ReactNode;
}) {
  return (
    <div className="grid grid-cols-[9rem_1fr] gap-3">
      <dt className="text-xs text-ink-faint">{label}</dt>
      <dd className="text-sm text-silver">{value}</dd>
    </div>
  );
}

function PriceRow({
  label,
  value,
  muted = false,
}: {
  label: string;
  value: string;
  muted?: boolean;
}) {
  return (
    <div className="flex items-center justify-between">
      <dt className={muted ? "text-ink-faint" : "text-silver"}>{label}</dt>
      <dd className={muted ? "text-ink-faint" : "text-white"}>{value}</dd>
    </div>
  );
}
