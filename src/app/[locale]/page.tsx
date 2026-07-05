import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Hero");
  const th = await getTranslations("Highlights");

  const highlights = [
    { title: th("onlineBooking"), desc: th("onlineBookingDesc") },
    { title: th("delivery"), desc: th("deliveryDesc") },
    { title: th("airport"), desc: th("airportDesc") },
    { title: th("premium"), desc: th("premiumDesc") },
  ];

  return (
    <>
      {/* HERO — placeholder cinematic backdrop until brand car photography lands */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10">
          <Parallax className="absolute inset-0" distance={60}>
            <div
              className="absolute inset-x-0 -inset-y-[20%]"
              style={{
                background:
                  "radial-gradient(120% 80% at 50% -10%, #181818 0%, #0a0a0a 42%, #000000 78%)",
              }}
            />
          </Parallax>
          {/* faint signal-red horizon glow, low and restrained */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(55% 90% at 50% 120%, rgba(237,28,36,0.16), transparent 70%)",
            }}
          />
          <div className="absolute inset-x-0 bottom-0 h-px bg-line" />
        </div>

        <Container className="py-28">
          <Reveal>
            <p className="label text-xs text-red">{t("eyebrow")}</p>
          </Reveal>
          <Reveal delay={0.08}>
            <h1 className="mt-6 max-w-4xl text-[2.75rem] leading-[1.02] md:text-7xl">
              {t("title")}
            </h1>
          </Reveal>
          <Reveal delay={0.16}>
            <p className="mt-8 max-w-xl text-base text-ink-muted md:text-lg">
              {t("subtitle")}
            </p>
          </Reveal>
          <Reveal delay={0.24}>
            <div className="mt-12 flex flex-wrap items-center gap-4">
              <ButtonLink href="/fleet" size="lg">
                {t("cta")}
              </ButtonLink>
              <ButtonLink href="/fleet" size="lg" variant="outline">
                {t("ctaSecondary")}
              </ButtonLink>
            </div>
          </Reveal>
        </Container>
      </section>

      {/* HIGHLIGHTS — the spec's "wyróżniki", as hairline-divided columns */}
      <section>
        <Container className="py-20 md:py-28">
          <Reveal>
            <h2 className="label text-xs text-ink-faint">{th("title")}</h2>
          </Reveal>

          <div className="mt-12 grid divide-y divide-line border-y border-line md:grid-cols-4 md:divide-x md:divide-y-0">
            {highlights.map((h, i) => (
              <Reveal
                key={h.title}
                delay={i * 0.08}
                className="px-0 py-8 md:px-8 md:first:pl-0"
              >
                <span className="label-tight text-xs text-red">
                  {`0${i + 1}`}
                </span>
                <h3 className="mt-6 font-heading text-xl font-bold text-white">
                  {h.title}
                </h3>
                <p className="mt-3 text-sm text-ink-muted">{h.desc}</p>
              </Reveal>
            ))}
          </div>
        </Container>
      </section>
    </>
  );
}
