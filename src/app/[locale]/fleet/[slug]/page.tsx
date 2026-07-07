import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { CarMedia } from "@/components/fleet/CarMedia";
import { Link } from "@/i18n/navigation";
import { getCarModelBySlug, getFleetSlugs } from "@/lib/fleet/repo";
import { getFeeCatalog, getLocations } from "@/lib/booking/repo";
import { BookingPanel } from "@/components/booking/BookingPanel";

export async function generateStaticParams() {
  const slugs = await getFleetSlugs();
  return slugs.map((slug) => ({ slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}): Promise<Metadata> {
  const { locale, slug } = await params;
  const car = await getCarModelBySlug(slug);
  if (!car) return {};
  const desc = locale === "en" ? car.descriptionEn : car.descriptionPl;
  return {
    title: `${car.brand} ${car.model} — A&A Corporation`,
    description: desc ?? undefined,
  };
}

export default async function CarDetailPage({
  params,
}: {
  params: Promise<{ locale: string; slug: string }>;
}) {
  const { locale, slug } = await params;
  setRequestLocale(locale);

  const car = await getCarModelBySlug(slug);
  if (!car) notFound();

  const t = await getTranslations("Fleet");
  const description = locale === "en" ? car.descriptionEn : car.descriptionPl;
  const [locations, fees] = await Promise.all([getLocations(), getFeeCatalog()]);

  const specs = [
    { label: t("yearLabel"), value: String(car.year) },
    { label: t("category.label"), value: t(`category.${car.category}`) },
    { label: t("seats"), value: String(car.seats) },
    { label: t("gearboxLabel"), value: t(`gearbox.${car.gearbox}`) },
    { label: t("fuelLabel"), value: t(`fuel.${car.fuel}`) },
    {
      label: t("kmLimit"),
      value:
        car.kmPerDayLimit === 0 ? t("kmUnlimited") : `${car.kmPerDayLimit} km`,
    },
  ];

  return (
    <Container className="py-10 md:py-16">
      <Link
        href="/fleet"
        className="label-tight text-[11px] text-ink-faint transition-colors hover:text-white"
      >
        ← {t("backToFleet")}
      </Link>

      {/* Full-bleed media */}
      <Reveal className="mt-6">
        <div className="relative aspect-[16/9] w-full overflow-hidden bg-surface-2 md:aspect-[21/9]">
          <CarMedia
            car={car}
            sizes="(min-width:1440px) 1440px, 100vw"
            priority
          />
          <span className="label-tight absolute left-5 top-5 rounded-pill border border-line-strong bg-void/60 px-3 py-1 text-[10px] text-white backdrop-blur-sm">
            {t(`category.${car.category}`)}
          </span>
        </div>
      </Reveal>

      <div className="mt-10 grid gap-12 lg:grid-cols-[1.6fr_1fr]">
        {/* Left: identity, specs, description */}
        <div>
          <Reveal>
            <h1 className="font-heading text-4xl font-bold md:text-5xl">
              {car.brand} {car.model}
            </h1>
            <p className="label-tight mt-2 text-xs text-ink-faint">{car.year}</p>
          </Reveal>

          <Reveal delay={0.05}>
            <dl className="mt-10 grid grid-cols-2 gap-px border border-line bg-line sm:grid-cols-3">
              {specs.map((s) => (
                <div key={s.label} className="bg-void px-5 py-5">
                  <dt className="label-tight text-[10px] text-ink-faint">
                    {s.label}
                  </dt>
                  <dd className="mt-2 text-sm text-white">{s.value}</dd>
                </div>
              ))}
            </dl>
          </Reveal>

          {description && (
            <Reveal delay={0.1}>
              <p className="mt-10 max-w-2xl text-sm leading-relaxed text-ink-muted md:text-base">
                {description}
              </p>
            </Reveal>
          )}
        </div>

        {/* Right: live booking calculator + reservation request */}
        <Reveal delay={0.1}>
          <aside className="lg:sticky lg:top-24">
            <BookingPanel car={car} locations={locations} fees={fees} />
          </aside>
        </Reveal>
      </div>
    </Container>
  );
}
