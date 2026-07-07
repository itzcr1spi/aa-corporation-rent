import Image from "next/image";
import { getTranslations, setRequestLocale } from "next-intl/server";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Reveal } from "@/components/motion/Reveal";
import { Parallax } from "@/components/motion/Parallax";
import { ModelsShowcase } from "@/components/fleet/ModelsShowcase";
import { getFleet } from "@/lib/fleet/repo";

export default async function HomePage({
  params,
}: {
  params: Promise<{ locale: string }>;
}) {
  const { locale } = await params;
  setRequestLocale(locale);

  const t = await getTranslations("Hero");
  const th = await getTranslations("Highlights");
  const fleet = await getFleet();

  const highlights = [
    { title: th("onlineBooking"), desc: th("onlineBookingDesc") },
    { title: th("delivery"), desc: th("deliveryDesc") },
    { title: th("airport"), desc: th("airportDesc") },
    { title: th("premium"), desc: th("premiumDesc") },
  ];

  return (
    <>
      {/* HERO — full-bleed BMW 740d photography under cinematic dark scrims */}
      <section className="relative flex min-h-[88vh] items-center overflow-hidden">
        <div aria-hidden className="absolute inset-0 -z-10 bg-void">
          {/* Photo drifts gently with scroll; oversized so parallax never reveals edges */}
          <Parallax className="absolute inset-0" distance={70}>
            <div className="absolute inset-x-0 -top-[8%] h-[116%] translate-x-[9%]">
              <Image
                src="/hero/bmw-740d.jpg"
                alt=""
                fill
                priority
                quality={90}
                sizes="100vw"
                className="object-cover object-[10%_center]"
              />
            </div>
          </Parallax>
          {/* Solid black panel on the left holds the text clear of the car; the photo
              emerges on the right. The (already dark) car keeps a light tint only. */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(90deg, rgba(0,0,0,0.97) 0%, rgba(0,0,0,0.94) 32%, rgba(0,0,0,0.6) 52%, rgba(0,0,0,0.2) 78%, rgba(0,0,0,0.34) 100%)",
            }}
          />
          {/* Slight top darkening for the nav + melt the bottom into the next section */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "linear-gradient(180deg, rgba(0,0,0,0.45) 0%, rgba(0,0,0,0) 24%, rgba(0,0,0,0) 60%, #000000 100%)",
            }}
          />
          {/* faint signal-red horizon glow, low and restrained */}
          <div
            className="absolute inset-0"
            style={{
              background:
                "radial-gradient(60% 70% at 50% 122%, rgba(237,28,36,0.14), transparent 70%)",
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

      {/* MODELS — Lamborghini-style swipeable showcase */}
      <ModelsShowcase cars={fleet} />

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
