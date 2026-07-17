import type { Metadata } from "next";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { Reveal } from "@/components/motion/Reveal";
import { ButtonLink } from "@/components/ui/Button";
import { getLocations } from "@/lib/booking/repo";
import { siteConfig } from "@/lib/config/site";
import { formatPln } from "@/lib/format";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ locale: string }>;
}): Promise<Metadata> {
  const { locale } = await params;
  const t = await getTranslations({ locale, namespace: "Contact" });
  return { title: `${t("eyebrow")} — A&A Corporation`, description: t("subtitle") };
}

export default async function ContactPage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);
  const t = await getTranslations("Contact");
  const locations = await getLocations();

  const methods: { label: string; value: string; href?: string }[] = [
    { label: t("phone"), value: siteConfig.phone, href: siteConfig.phoneHref },
    { label: t("email"), value: siteConfig.email, href: `mailto:${siteConfig.email}` },
    { label: t("address"), value: siteConfig.city },
    { label: t("hours"), value: t("hoursValue") },
  ];

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

      {/* Contact methods */}
      <div className="mt-14 grid gap-px border-y border-line sm:grid-cols-2 lg:grid-cols-4">
        {methods.map((m, i) => (
          <Reveal
            key={m.label}
            delay={(i % 4) * 0.06}
            className="border-line py-8 sm:border-r sm:px-8 sm:first:pl-0 lg:[&:nth-child(4)]:border-r-0"
          >
            <p className="label-tight text-[10px] text-ink-faint">{m.label}</p>
            {m.href ? (
              <a
                href={m.href}
                className="mt-3 block font-heading text-lg font-bold text-white transition-colors hover:text-red"
              >
                {m.value}
              </a>
            ) : (
              <p className="mt-3 font-heading text-lg font-bold text-white">
                {m.value}
              </p>
            )}
          </Reveal>
        ))}
      </div>

      {/* Primary CTAs */}
      <Reveal className="mt-10 flex flex-wrap gap-4">
        <a
          href={siteConfig.phoneHref}
          className="label inline-flex h-14 items-center justify-center bg-red px-9 text-sm text-white transition-colors hover:bg-red-hover"
        >
          {t("call")}
        </a>
        <a
          href={`mailto:${siteConfig.email}`}
          className="label inline-flex h-14 items-center justify-center border border-line-strong px-9 text-sm text-white transition-colors hover:border-white hover:bg-white/5"
        >
          {t("write")}
        </a>
      </Reveal>

      {/* Pick-up locations */}
      <div className="mt-20">
        <Reveal>
          <h2 className="label text-xs text-ink-faint">{t("locationsTitle")}</h2>
        </Reveal>
        <div className="mt-8 grid divide-y divide-line border-y border-line md:grid-cols-3 md:divide-x md:divide-y-0">
          {locations.map((l, i) => (
            <Reveal
              key={l.slug}
              delay={i * 0.06}
              className="px-0 py-6 md:px-8 md:first:pl-0"
            >
              <p className="font-heading text-lg font-bold text-white">
                {locale === "en" ? l.nameEn : l.name}
              </p>
              {l.address && (
                <p className="mt-2 text-sm text-ink-muted">{l.address}</p>
              )}
              <p className="label-tight mt-3 text-[11px] text-red">
                {l.feeGrosze > 0 ? `+${formatPln(l.feeGrosze, locale)}` : "—"}
              </p>
            </Reveal>
          ))}
        </div>
      </div>

      <Reveal className="mt-16 text-center">
        <ButtonLink href="/fleet" size="lg">
          {t("book")}
        </ButtonLink>
      </Reveal>
    </Container>
  );
}
