"use client";

import { useState } from "react";
import { AnimatePresence, motion, useReducedMotion } from "framer-motion";
import { useLocale, useTranslations } from "next-intl";
import { Container } from "@/components/ui/Container";
import { ButtonLink } from "@/components/ui/Button";
import { Link } from "@/i18n/navigation";
import { CarMedia } from "./CarMedia";
import { formatPln } from "@/lib/format";
import { cn } from "@/lib/utils";
import type { FleetCar } from "@/lib/fleet/types";

function Chevron({ dir }: { dir: "left" | "right" }) {
  return (
    <svg width="18" height="18" viewBox="0 0 24 24" fill="none" aria-hidden="true">
      <path
        d={dir === "left" ? "M15 5l-7 7 7 7" : "M9 5l7 7-7 7"}
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

const arrowCls =
  "flex h-11 w-11 items-center justify-center border border-line-strong text-white transition-colors hover:border-red hover:text-red";

/**
 * Lamborghini-style model showcase: a big ghosted brand wordmark, one car
 * centered on stage, prev/next + model tabs, swipeable on touch. Motion is
 * disabled under prefers-reduced-motion.
 */
export function ModelsShowcase({ cars }: { cars: FleetCar[] }) {
  const t = useTranslations("Fleet");
  const locale = useLocale();
  const reduce = useReducedMotion();
  const [index, setIndex] = useState(0);
  const [dir, setDir] = useState(1);

  if (cars.length === 0) return null;
  const n = cars.length;
  const active = cars[index];

  const step = (d: number) => {
    setDir(d);
    setIndex((i) => (i + d + n) % n);
  };
  const jump = (i: number) => {
    setDir(i >= index ? 1 : -1);
    setIndex(i);
  };

  const offset = 90;

  return (
    <section className="relative overflow-hidden border-t border-line bg-void py-16 md:py-24">
      <Container>
        <div className="flex items-end justify-between gap-6">
          <div>
            <p className="label text-xs text-red">{t("eyebrow")}</p>
            <h2 className="mt-3 font-heading text-3xl font-bold md:text-5xl">
              {t("ourModels")}
            </h2>
          </div>
          <div className="hidden gap-3 md:flex">
            <button onClick={() => step(-1)} aria-label={t("prev")} className={arrowCls}>
              <Chevron dir="left" />
            </button>
            <button onClick={() => step(1)} aria-label={t("next")} className={arrowCls}>
              <Chevron dir="right" />
            </button>
          </div>
        </div>

        {/* Stage */}
        <div className="relative mt-6 flex min-h-[40vh] items-center justify-center md:mt-10 md:min-h-[46vh]">
          {/* Ghosted brand wordmark, peeking above the car */}
          <span
            aria-hidden="true"
            className="pointer-events-none absolute inset-x-0 top-0 flex select-none justify-center overflow-hidden"
          >
            <span className="-translate-y-[16%] whitespace-nowrap font-heading text-[26vw] font-bold uppercase leading-none tracking-tighter text-white/[0.05] md:text-[15vw]">
              {active.brand}
            </span>
          </span>

          {/* Touch arrows */}
          <button
            onClick={() => step(-1)}
            aria-label={t("prev")}
            className="absolute left-0 z-20 flex h-10 w-10 items-center justify-center bg-void/50 text-white backdrop-blur-sm md:hidden"
          >
            <Chevron dir="left" />
          </button>
          <button
            onClick={() => step(1)}
            aria-label={t("next")}
            className="absolute right-0 z-20 flex h-10 w-10 items-center justify-center bg-void/50 text-white backdrop-blur-sm md:hidden"
          >
            <Chevron dir="right" />
          </button>

          <AnimatePresence mode="wait" custom={dir} initial={false}>
            <motion.div
              key={active.slug}
              custom={dir}
              initial={reduce ? { opacity: 0 } : { opacity: 0, x: dir * offset }}
              animate={{ opacity: 1, x: 0 }}
              exit={reduce ? { opacity: 0 } : { opacity: 0, x: dir * -offset }}
              transition={{ duration: 0.55, ease: [0.22, 1, 0.36, 1] }}
              drag="x"
              dragConstraints={{ left: 0, right: 0 }}
              dragElastic={0.18}
              onDragEnd={(_, info) => {
                if (info.offset.x < -70) step(1);
                else if (info.offset.x > 70) step(-1);
              }}
              className="relative z-10 w-full max-w-3xl cursor-grab touch-pan-y active:cursor-grabbing"
            >
              <div className="relative mx-auto aspect-[16/9] w-full">
                {active.images.length > 0 ? (
                  <CarMedia
                    car={active}
                    sizes="(min-width:768px) 60vw, 90vw"
                    priority
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center">
                    <span className="font-heading text-3xl font-bold uppercase tracking-wide text-silver/80 md:text-5xl">
                      {active.model}
                    </span>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {/* Active model meta */}
        <div className="mt-4 flex flex-col items-center text-center md:mt-6">
          <span className="label-tight rounded-pill border border-line-strong px-3 py-1 text-[10px] text-silver">
            {t(`category.${active.category}`)}
          </span>
          <h3 className="mt-4 font-heading text-2xl font-bold md:text-3xl">
            {active.brand} {active.model}
          </h3>
          <p className="mt-2 text-sm text-ink-muted">
            {t("from")}{" "}
            <span className="text-white">
              {formatPln(active.dailyPriceGrosze, locale)}
            </span>{" "}
            / {t("perDay")}
          </p>
          <ButtonLink href={`/fleet/${active.slug}`} className="mt-6">
            {t("viewCar")}
          </ButtonLink>
        </div>

        {/* Desktop: model tabs */}
        <div className="mt-12 hidden flex-wrap items-center justify-center gap-x-8 gap-y-3 md:flex">
          {cars.map((c, i) => (
            <button
              key={c.slug}
              onClick={() => jump(i)}
              className={cn(
                "label-tight relative pb-2 text-[11px] transition-colors",
                i === index ? "text-white" : "text-ink-faint hover:text-silver",
              )}
            >
              {c.brand} {c.model}
              {i === index && (
                <span className="absolute inset-x-0 bottom-0 h-px bg-red" />
              )}
            </button>
          ))}
        </div>

        {/* Mobile: dots */}
        <div className="mt-8 flex items-center justify-center gap-2.5 md:hidden">
          {cars.map((c, i) => (
            <button
              key={c.slug}
              onClick={() => jump(i)}
              aria-label={`${c.brand} ${c.model}`}
              className={cn(
                "h-1.5 rounded-pill transition-all",
                i === index ? "w-6 bg-red" : "w-1.5 bg-line-strong",
              )}
            />
          ))}
        </div>

        <div className="mt-10 text-center">
          <Link
            href="/fleet"
            className="label-tight text-[11px] text-silver transition-colors hover:text-white"
          >
            {t("viewAll")} →
          </Link>
        </div>
      </Container>
    </section>
  );
}
