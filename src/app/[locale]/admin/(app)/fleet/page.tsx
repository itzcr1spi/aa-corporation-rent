import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { listFleet } from "@/lib/admin/fleet";
import { CATEGORY_LABEL, type Category } from "@/lib/admin/fleet-options";
import { formatPln } from "@/lib/format";

export default async function FleetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const models = await listFleet();

  return (
    <div>
      <header className="mb-8 flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-2xl text-white">Flota</h1>
          <p className="mt-1 text-sm text-silver">
            {models.length} {models.length === 1 ? "model" : "modeli"}
          </p>
        </div>
        <Link
          href="/admin/fleet/new"
          className="label inline-flex h-11 items-center bg-red px-6 text-xs text-white transition-colors hover:bg-red-hover"
        >
          + Dodaj model
        </Link>
      </header>

      {models.length === 0 ? (
        <p className="border border-line bg-graphite/40 p-10 text-center text-sm text-silver">
          Brak modeli. Dodaj pierwszy, aby pojawił się na stronie.
        </p>
      ) : (
        <div className="overflow-x-auto border border-line">
          <table className="w-full min-w-3xl border-collapse text-sm">
            <thead>
              <tr className="border-b border-line bg-graphite/60 text-left">
                <th className="label-tight px-4 py-3 text-[10px] font-normal text-ink-faint">Model</th>
                <th className="label-tight px-4 py-3 text-[10px] font-normal text-ink-faint">Rok</th>
                <th className="label-tight px-4 py-3 text-[10px] font-normal text-ink-faint">Segment</th>
                <th className="label-tight px-4 py-3 text-right text-[10px] font-normal text-ink-faint">Cena / doba</th>
                <th className="label-tight px-4 py-3 text-[10px] font-normal text-ink-faint">Egzemplarze</th>
                <th className="label-tight px-4 py-3 text-[10px] font-normal text-ink-faint">Status</th>
              </tr>
            </thead>
            <tbody>
              {models.map((m) => (
                <tr
                  key={m.id}
                  className="border-b border-line/60 transition-colors last:border-0 hover:bg-white/5"
                >
                  <td className="px-4 py-3">
                    <Link
                      href={`/admin/fleet/${m.id}`}
                      className="text-white underline-offset-4 hover:underline"
                    >
                      {m.brand} {m.model}
                    </Link>
                    <span className="ml-2 font-mono text-xs text-ink-faint">
                      {m.slug}
                    </span>
                  </td>
                  <td className="px-4 py-3 text-silver">{m.year}</td>
                  <td className="px-4 py-3 text-silver">
                    {CATEGORY_LABEL[m.category as Category] ?? m.category}
                  </td>
                  <td className="px-4 py-3 text-right text-white">
                    {formatPln(m.dailyPriceGrosze, locale)}
                  </td>
                  <td className="px-4 py-3 text-silver">
                    <span className="text-white">{m.units.available}</span>
                    <span className="text-ink-faint"> / {m.units.total} dostępnych</span>
                  </td>
                  <td className="px-4 py-3">
                    {m.published ? (
                      <span className="label-tight border border-line px-2 py-1 text-[10px] text-silver">
                        Opublikowany
                      </span>
                    ) : (
                      <span className="label-tight border border-line px-2 py-1 text-[10px] text-ink-faint">
                        Ukryty
                      </span>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
}
