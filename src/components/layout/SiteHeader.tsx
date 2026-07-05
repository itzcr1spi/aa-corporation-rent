"use client";

import { useState } from "react";
import { useTranslations } from "next-intl";
import { Link } from "@/i18n/navigation";
import { Logo } from "@/components/brand/Logo";
import { LocaleSwitcher } from "./LocaleSwitcher";
import { ButtonLink } from "@/components/ui/Button";
import { mainNav } from "@/lib/config/site";

export function SiteHeader() {
  const t = useTranslations("Nav");
  const [open, setOpen] = useState(false);

  return (
    <header className="sticky top-0 z-50 border-b border-line bg-void/80 backdrop-blur-md">
      <div className="mx-auto flex h-20 max-w-[1440px] items-center justify-between gap-6 px-6 md:px-10">
        <Logo priority />

        <nav className="hidden items-center gap-9 md:flex">
          {mainNav.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className="label-tight text-xs text-silver transition-colors hover:text-white"
            >
              {t(item.key)}
            </Link>
          ))}
        </nav>

        <div className="hidden items-center gap-6 md:flex">
          <LocaleSwitcher />
          <ButtonLink href="/fleet" size="sm">
            {t("book")}
          </ButtonLink>
        </div>

        {/* Mobile trigger */}
        <button
          type="button"
          onClick={() => setOpen((v) => !v)}
          aria-label={t("menu")}
          aria-expanded={open}
          className="flex h-10 w-10 flex-col items-center justify-center gap-[6px] md:hidden"
        >
          <span
            className="block h-px w-6 bg-white transition-transform duration-300"
            style={open ? { transform: "translateY(3.5px) rotate(45deg)" } : undefined}
          />
          <span
            className="block h-px w-6 bg-white transition-transform duration-300"
            style={open ? { transform: "translateY(-3.5px) rotate(-45deg)" } : undefined}
          />
        </button>
      </div>

      {/* Mobile panel */}
      {open && (
        <div className="border-t border-line bg-void md:hidden">
          <nav className="mx-auto flex max-w-[1440px] flex-col px-6 py-4">
            {mainNav.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                onClick={() => setOpen(false)}
                className="label-tight border-b border-line py-4 text-sm text-silver hover:text-white"
              >
                {t(item.key)}
              </Link>
            ))}
            <div className="flex items-center justify-between pt-5">
              <LocaleSwitcher />
              <ButtonLink href="/fleet" size="sm">
                {t("book")}
              </ButtonLink>
            </div>
          </nav>
        </div>
      )}
    </header>
  );
}
