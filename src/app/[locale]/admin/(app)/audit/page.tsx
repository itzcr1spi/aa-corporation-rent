import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import {
  listAudit,
  isAuditCategory,
  AUDIT_CATEGORIES,
  type AuditEntry,
  type AuditCategory,
} from "@/lib/admin/audit";
import { formatDateTimePl } from "@/lib/format";

const CATEGORY_LABEL: Record<AuditCategory, string> = {
  login: "Logowanie",
  reservation: "Rezerwacje",
  fleet: "Flota",
  pricing: "Cennik",
  admin: "Konta",
};

const ACTION_LABEL: Record<string, string> = {
  "login.success": "Zalogowano",
  "login.fail": "Nieudane logowanie",
  "reservation.confirmed": "Rezerwacja potwierdzona",
  "reservation.rejected": "Rezerwacja odrzucona",
  "reservation.cancelled": "Rezerwacja anulowana",
  "reservation.completed": "Rezerwacja zakończona",
  "pricing.model.update": "Zmiana cen modelu",
  "pricing.fee.update": "Zmiana opłaty",
  "pricing.location.update": "Zmiana opłaty za odbiór",
  "fleet.model.create": "Dodano model",
  "fleet.model.update": "Zmieniono model",
  "fleet.model.delete": "Usunięto model",
  "fleet.car.create": "Dodano egzemplarz",
  "fleet.car.update": "Zmieniono egzemplarz",
  "fleet.car.delete": "Usunięto egzemplarz",
};

export default async function AuditPage({
  params,
  searchParams,
}: {
  params: Promise<{ locale: string }>;
  searchParams: Promise<Record<string, string | string[] | undefined>>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const sp = await searchParams;

  const category = isAuditCategory(sp.category) ? sp.category : undefined;
  const page = Math.max(1, Number(sp.page) || 1);
  const { items, total, pageSize } = await listAudit({ category, page });
  const pages = Math.max(1, Math.ceil(total / pageSize));

  const pageHref = (n: number) => {
    const p = new URLSearchParams();
    if (category) p.set("category", category);
    if (n > 1) p.set("page", String(n));
    const s = p.toString();
    return `/admin/audit${s ? `?${s}` : ""}`;
  };

  return (
    <div>
      <header className="mb-8">
        <h1 className="font-display text-2xl text-white">Dziennik zdarzeń</h1>
        <p className="mt-1 text-sm text-silver">
          Niezmienialny zapis działań w panelu. {total} wpisów.
        </p>
      </header>

      <form method="get" className="mb-6 flex flex-wrap items-end gap-3">
        <label className="flex flex-col gap-1">
          <span className="label-tight text-[10px] text-ink-faint">Kategoria</span>
          <select
            name="category"
            defaultValue={category ?? ""}
            className="h-11 border border-line-strong bg-black px-3 text-sm text-white"
          >
            <option value="">Wszystkie</option>
            {AUDIT_CATEGORIES.map((c) => (
              <option key={c} value={c}>
                {CATEGORY_LABEL[c]}
              </option>
            ))}
          </select>
        </label>
        <button
          type="submit"
          className="label inline-flex h-11 items-center border border-line-strong px-6 text-xs text-white transition-colors hover:border-white hover:bg-white/5"
        >
          Filtruj
        </button>
        {category && (
          <Link
            href="/admin/audit"
            className="label inline-flex h-11 items-center px-3 text-xs text-ink-faint transition-colors hover:text-white"
          >
            Wyczyść
          </Link>
        )}
      </form>

      {items.length === 0 ? (
        <p className="border border-line bg-graphite/40 p-10 text-center text-sm text-silver">
          Brak zdarzeń.
        </p>
      ) : (
        <ul className="divide-y divide-line border border-line">
          {items.map((e) => (
            <AuditRow key={e.id} entry={e} />
          ))}
        </ul>
      )}

      {pages > 1 && (
        <nav className="mt-6 flex items-center justify-between text-sm">
          {page > 1 ? (
            <Link href={pageHref(page - 1)} className="text-silver hover:text-white">
              ← Nowsze
            </Link>
          ) : (
            <span className="text-ink-faint opacity-40">← Nowsze</span>
          )}
          <span className="text-ink-faint">
            Strona {page} z {pages}
          </span>
          {page < pages ? (
            <Link href={pageHref(page + 1)} className="text-silver hover:text-white">
              Starsze →
            </Link>
          ) : (
            <span className="text-ink-faint opacity-40">Starsze →</span>
          )}
        </nav>
      )}
    </div>
  );
}

function AuditRow({ entry }: { entry: AuditEntry }) {
  const category = entry.action.split(".")[0];
  const actionLabel = ACTION_LABEL[entry.action] ?? entry.action;
  const hasDetail = entry.before != null || entry.after != null;

  return (
    <li className="p-4">
      <div className="flex flex-wrap items-baseline justify-between gap-x-4 gap-y-1">
        <div className="flex items-baseline gap-3">
          <span className="label-tight w-24 shrink-0 text-[10px] text-ink-faint">
            {isAuditCategory(category) ? CATEGORY_LABEL[category] : category}
          </span>
          <span className="text-sm text-white">{actionLabel}</span>
          {entry.entity && (
            <span className="font-mono text-xs text-ink-faint">
              {entry.entity}
              {entry.entityId ? `:${entry.entityId.slice(0, 8)}` : ""}
            </span>
          )}
        </div>
        <div className="flex items-baseline gap-3 text-xs text-ink-faint">
          <span>{entry.adminEmail ?? "system"}</span>
          {entry.ip && <span className="font-mono">{entry.ip}</span>}
          <time className="text-silver">{formatDateTimePl(entry.createdAt)}</time>
        </div>
      </div>
      {hasDetail && (
        <details className="mt-2">
          <summary className="cursor-pointer text-xs text-ink-faint hover:text-white">
            Szczegóły
          </summary>
          <div className="mt-2 grid gap-3 sm:grid-cols-2">
            <JsonBlock title="Przed" value={entry.before} />
            <JsonBlock title="Po" value={entry.after} />
          </div>
        </details>
      )}
    </li>
  );
}

function JsonBlock({ title, value }: { title: string; value: unknown }) {
  if (value == null) return null;
  return (
    <div>
      <p className="label-tight mb-1 text-[10px] text-ink-faint">{title}</p>
      <pre className="overflow-x-auto border border-line bg-black p-3 font-mono text-[11px] text-silver">
        {JSON.stringify(value, null, 2)}
      </pre>
    </div>
  );
}
