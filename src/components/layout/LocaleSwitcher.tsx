"use client";

import { useLocale } from "next-intl";
import { Link, usePathname } from "@/i18n/navigation";
import { routing } from "@/i18n/routing";
import { cn } from "@/lib/utils";

/** PL / EN toggle that preserves the current path. */
export function LocaleSwitcher() {
  const active = useLocale();
  const pathname = usePathname();

  return (
    <div className="label-tight flex items-center gap-2 text-[11px]">
      {routing.locales.map((locale, i) => (
        <span key={locale} className="flex items-center gap-2">
          {i > 0 && <span className="text-ink-faint">/</span>}
          <Link
            href={pathname}
            locale={locale}
            aria-current={locale === active ? "true" : undefined}
            className={cn(
              "transition-colors",
              locale === active
                ? "text-white"
                : "text-ink-faint hover:text-silver",
            )}
          >
            {locale.toUpperCase()}
          </Link>
        </span>
      ))}
    </div>
  );
}
