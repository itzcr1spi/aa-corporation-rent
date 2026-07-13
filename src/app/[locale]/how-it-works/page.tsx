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
  const t = await getTranslations({ locale, namespace: "HowItWorks" });
  return { title: `${t("eyebrow")} — A&A Corporation`, description: t("subtitle") };
}

export default async function HowItWorksPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("HowItWorks");

  const steps = [1, 2, 3, 4, 5, 6].map((n) => ({
    n,
    title: t(`steps.s${n}Title`),
    desc: t(`steps.s${n}Desc`),
  }));

  return (
    <Container className="py-16 md:py-24">
      <div className="max-w-3xl">
        <Reveal>
          <p className="label text-xs text-red">{t("eyebrow")}</p>
          <h1 className="mt-4 font-heading text-4xl font-bold md:text-6xl">
            {t("title")}
          </h1>
        </Reveal>
        <Reveal delay={0.08}>
          <p className="mt-6 text-base leading-relaxed text-ink-muted md:text-lg">
            {t("subtitle")}
          </p>
        </Reveal>
      </div>

      <div className="mt-14 border-t border-line">
        {steps.map((s, i) => (
          <Reveal
            key={s.n}
            delay={(i % 3) * 0.06}
            className="grid gap-3 border-b border-line py-8 md:grid-cols-[auto_1fr] md:gap-12"
          >
            <span className="font-heading text-4xl font-bold leading-none text-red md:text-5xl">
              {`0${s.n}`}
            </span>
            <div>
              <h2 className="font-heading text-xl font-bold text-white md:text-2xl">
                {s.title}
              </h2>
              <p className="mt-2 max-w-xl text-sm text-ink-muted md:text-base">
                {s.desc}
              </p>
            </div>
          </Reveal>
        ))}
      </div>

      <Reveal className="mt-16 text-center md:text-left">
        <ButtonLink href="/fleet" size="lg">
          {t("cta")}
        </ButtonLink>
      </Reveal>
    </Container>
  );
}
