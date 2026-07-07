import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { CarCard } from "@/components/fleet/CarCard";
import { getFleet } from "@/lib/fleet/repo";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Fleet" });
  return {
    title: `${t("title")} — A&A Corporation`,
    description: t("subtitle"),
  };
}

export default async function FleetPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Fleet");
  const fleet = await getFleet();

  return (
    <Container className="py-16 md:py-24">
      <Reveal>
        <p className="label text-xs text-red">{t("eyebrow")}</p>
        <h1 className="mt-4 font-heading text-4xl font-bold md:text-6xl">
          {t("title")}
        </h1>
        <p className="mt-5 max-w-xl text-sm text-ink-muted md:text-base">
          {t("subtitle")}
        </p>
      </Reveal>

      <div className="mt-14 grid gap-x-8 gap-y-14 sm:grid-cols-2 lg:grid-cols-3">
        {fleet.map((car, i) => (
          <Reveal key={car.slug} delay={(i % 3) * 0.08}>
            <CarCard car={car} />
          </Reveal>
        ))}
      </div>
    </Container>
  );
}
