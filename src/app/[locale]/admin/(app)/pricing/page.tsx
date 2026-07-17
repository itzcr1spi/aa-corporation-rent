import { setRequestLocale } from "next-intl/server";
import { listPricing } from "@/lib/admin/pricing";
import {
  ModelPriceRow,
  FeeRow,
  LocationRow,
} from "./PricingForms";

export default async function PricingPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const { models, fees, locations } = await listPricing();

  return (
    <div className="max-w-4xl">
      <header className="mb-8">
        <h1 className="font-display text-2xl text-white">Cennik</h1>
        <p className="mt-1 text-sm text-silver">
          Zmiany dotyczą tylko nowych rezerwacji. Złożone rezerwacje mają
          zapisaną własną wycenę.
        </p>
      </header>

      <Section title="Ceny aut" subtitle="Stawka dobowa, miesięczna i kaucja">
        {models.length === 0 ? (
          <Empty>Brak modeli.</Empty>
        ) : (
          models.map((m) => <ModelPriceRow key={m.id} model={m} />)
        )}
      </Section>

      <Section
        title="Opłaty dodatkowe"
        subtitle="Dopłaty doliczane w kalkulatorze rezerwacji"
      >
        {fees.length === 0 ? (
          <Empty>Brak zdefiniowanych opłat.</Empty>
        ) : (
          fees.map((f) => <FeeRow key={f.id} fee={f} />)
        )}
      </Section>

      <Section title="Miejsca odbioru" subtitle="Opłata za odbiór poza siedzibą">
        {locations.length === 0 ? (
          <Empty>Brak lokalizacji.</Empty>
        ) : (
          locations.map((l) => <LocationRow key={l.id} location={l} />)
        )}
      </Section>
    </div>
  );
}

function Section({
  title,
  subtitle,
  children,
}: {
  title: string;
  subtitle: string;
  children: React.ReactNode;
}) {
  return (
    <section className="mb-10">
      <div className="mb-2">
        <h2 className="label text-xs text-white">{title}</h2>
        <p className="text-xs text-ink-faint">{subtitle}</p>
      </div>
      <div className="border border-line bg-graphite/40 px-5">{children}</div>
    </section>
  );
}

function Empty({ children }: { children: React.ReactNode }) {
  return <p className="py-6 text-center text-sm text-silver">{children}</p>;
}
