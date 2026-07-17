import { notFound } from "next/navigation";
import { setRequestLocale } from "next-intl/server";
import { Link } from "@/i18n/navigation";
import { getModelWithUnits } from "@/lib/admin/fleet";
import { ModelForm } from "../ModelForm";
import { UnitRow, AddUnit } from "../UnitManager";
import { DeleteModelButton } from "../DeleteModelButton";
import { updateModel } from "../actions";

const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function EditModelPage({
  params,
}: {
  params: Promise<{ locale: string; id: string }>;
}) {
  const { locale, id } = await params;
  setRequestLocale(locale);

  if (!UUID_RE.test(id)) notFound();
  const data = await getModelWithUnits(id);
  if (!data) notFound();
  const { model, units } = data;

  return (
    <div className="max-w-4xl">
      <Link
        href="/admin/fleet"
        className="label-tight text-[10px] text-ink-faint transition-colors hover:text-white"
      >
        ← Flota
      </Link>
      <h1 className="mt-4 mb-8 font-display text-2xl text-white">
        {model.brand} {model.model}
      </h1>

      <ModelForm action={updateModel} model={model} />

      <section className="mt-14">
        <div className="mb-4 flex items-center justify-between">
          <div>
            <h2 className="label text-xs text-white">Egzemplarze</h2>
            <p className="text-xs text-ink-faint">
              Fizyczne auta tego modelu — rezerwacje dotyczą konkretnego
              egzemplarza.
            </p>
          </div>
        </div>

        <div className="border border-line bg-graphite/40 px-5">
          {units.length === 0 ? (
            <p className="py-6 text-center text-sm text-silver">
              Brak egzemplarzy. Dodaj pierwszy poniżej.
            </p>
          ) : (
            units.map((u) => <UnitRow key={u.id} unit={u} />)
          )}
        </div>

        <div className="mt-4">
          <AddUnit modelId={model.id} />
        </div>
      </section>

      <section className="mt-14 border-t border-line pt-8">
        <h2 className="label mb-1 text-xs text-red">Strefa niebezpieczna</h2>
        <p className="mb-4 text-xs text-ink-faint">
          Usunięcie jest możliwe tylko, gdy model nie ma egzemplarzy ani
          rezerwacji. W innym wypadku ukryj model, odznaczając „Opublikowany”.
        </p>
        <DeleteModelButton id={model.id} />
      </section>
    </div>
  );
}
