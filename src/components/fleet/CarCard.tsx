import { useLocale, useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { CarMedia } from "./CarMedia";
import { formatPln } from "@/lib/format";
import type { FleetCar } from "@/lib/fleet/types";

function Spec({ label, value }: { label: string; value: string }) {
  return (
    <div className="px-2 py-3 text-center">
      <p className="label-tight text-[9px] text-ink-faint">{label}</p>
      <p className="mt-1 text-xs text-white">{value}</p>
    </div>
  );
}

export function CarCard({ car }: { car: FleetCar }) {
  const t = useTranslations("Fleet");
  const locale = useLocale();
  const soldOut = car.availableCount === 0;

  return (
    <Link href={`/fleet/${car.slug}`} className="group flex flex-col">
      <div className="relative aspect-[16/10] overflow-hidden bg-surface-2">
        <CarMedia
          car={car}
          sizes="(min-width:1024px) 33vw, (min-width:640px) 50vw, 100vw"
        />
        <span className="label-tight absolute left-4 top-4 rounded-pill border border-line-strong bg-void/60 px-3 py-1 text-[10px] text-white backdrop-blur-sm">
          {t(`category.${car.category}`)}
        </span>
        {soldOut && (
          <span className="label-tight absolute right-4 top-4 bg-void/70 px-2 py-1 text-[10px] text-red backdrop-blur-sm">
            {t("unavailable")}
          </span>
        )}
      </div>

      <div className="flex flex-1 flex-col border-t border-line pt-5">
        <div className="flex items-start justify-between gap-4">
          <div>
            <h3 className="font-heading text-lg font-bold text-white">
              {car.brand} {car.model}
            </h3>
            <p className="label-tight mt-1 text-[11px] text-ink-faint">
              {car.year}
            </p>
          </div>
          <div className="shrink-0 text-right">
            <p className="font-heading text-xl font-bold text-white">
              {formatPln(car.dailyPriceGrosze, locale)}
            </p>
            <p className="label-tight text-[10px] text-ink-faint">
              / {t("perDay")}
            </p>
          </div>
        </div>

        <div className="mt-5 grid grid-cols-4 divide-x divide-line border-y border-line">
          <Spec label={t("seats")} value={String(car.seats)} />
          <Spec label={t("gearboxLabel")} value={t(`gearbox.${car.gearbox}`)} />
          <Spec label={t("fuelLabel")} value={t(`fuel.${car.fuel}`)} />
          <Spec
            label={t("kmLimit")}
            value={
              car.kmPerDayLimit === 0
                ? t("kmUnlimited")
                : String(car.kmPerDayLimit)
            }
          />
        </div>

        <div className="mt-auto flex items-center justify-between pt-5">
          <span className="text-xs text-ink-muted">
            {t("perMonth")} {formatPln(car.monthlyPriceGrosze, locale)}
          </span>
          <span className="label-tight text-[11px] text-red transition-colors group-hover:text-white">
            {t("viewCar")} →
          </span>
        </div>
      </div>
    </Link>
  );
}
