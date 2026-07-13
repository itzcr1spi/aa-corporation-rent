import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "About" });
  return { title: `${t("eyebrow")} — A&A Corporation`, description: t("intro") };
}

export default async function AboutPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("About");

  const pillars = [
    { top: t("pillars.premiumTop"), sub: t("pillars.premiumSub") },
    { top: t("pillars.trustTop"), sub: t("pillars.trustSub") },
    { top: t("pillars.modernTop"), sub: t("pillars.modernSub") },
  ];

  const values = [
    "passion",
    "professionalism",
    "honesty",
    "safety",
    "innovation",
    "detail",
  ] as const;

  return (
    <Container className="py-16 md:py-24">
      {/* Intro */}
      <div className="max-w-4xl">
        <Reveal>
          <p className="label text-xs text-red">{t("eyebrow")}</p>
          <h1 className="mt-4 font-heading text-4xl font-bold md:text-6xl">
            {t("title")}
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-8 text-base leading-relaxed text-ink-muted md:text-lg">
            {t("intro")}
          </p>
        </Reveal>
      </div>

      {/* Pillars */}
      <div className="mt-16 grid divide-y divide-line border-y border-line sm:grid-cols-3 sm:divide-x sm:divide-y-0">
        {pillars.map((p, i) => (
          <Reveal
            key={p.top}
            delay={i * 0.08}
            className="px-0 py-8 sm:px-8 sm:first:pl-0"
          >
            <p className="font-heading text-2xl font-bold text-white">{p.top}</p>
            <p className="label-tight mt-2 text-xs text-red">{p.sub}</p>
          </Reveal>
        ))}
      </div>

      {/* Mission + Vision */}
      <div className="mt-20 grid gap-12 md:grid-cols-2 md:gap-16">
        <Reveal>
          <h2 className="label text-xs text-ink-faint">{t("missionTitle")}</h2>
          <p className="mt-5 font-heading text-xl font-bold leading-snug md:text-2xl">
            {t("mission")}
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h2 className="label text-xs text-ink-faint">{t("visionTitle")}</h2>
          <p className="mt-5 font-heading text-xl font-bold leading-snug md:text-2xl">
            {t("vision")}
          </p>
        </Reveal>
      </div>

      {/* Values */}
      <div className="mt-20">
        <Reveal>
          <h2 className="label text-xs text-ink-faint">{t("valuesTitle")}</h2>
        </Reveal>
        <div className="mt-8 grid gap-x-8 gap-y-px border-y border-line sm:grid-cols-2 lg:grid-cols-3">
          {values.map((v, i) => (
            <Reveal
              key={v}
              delay={(i % 3) * 0.06}
              className="flex items-baseline gap-4 border-line py-6"
            >
              <span className="label-tight text-xs text-red">{`0${i + 1}`}</span>
              <span className="text-lg text-white">{t(`values.${v}`)}</span>
            </Reveal>
          ))}
        </div>
      </div>

      {/* CTA */}
      <Reveal className="mt-24 border-t border-line pt-16 text-center">
        <h2 className="font-heading text-3xl font-bold md:text-4xl">
          {t("ctaTitle")}
        </h2>
        <div className="mt-8">
          <ButtonLink href="/fleet" size="lg">
            {t("cta")}
          </ButtonLink>
        </div>
      </Reveal>
    </Container>
  );
}
