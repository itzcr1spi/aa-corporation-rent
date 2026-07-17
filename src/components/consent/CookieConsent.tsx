"use client";

import { useEffect, useState } from "react";
import { Link } from "@/i18n/navigation";

// localStorage + cookie key holding the visitor's choice ("all" | "essential").
// The choice record itself is strictly necessary, so it is allowed without consent.
// The app sets NO non-essential cookies today; this banner is the gate for any
// analytics added later — they must check getCookieConsent() === "all" first.
const KEY = "aa-cookie-consent";
export const COOKIE_OPEN_EVENT = "aa:cookie-open";

type Choice = "all" | "essential";

export type ConsentLabels = {
  title: string;
  body: string;
  acceptAll: string;
  essential: string;
  privacy: string;
};

export function CookieConsent({ labels }: { labels: ConsentLabels }) {
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    let stored: string | null = null;
    try {
      stored = localStorage.getItem(KEY);
    } catch {
      stored = null;
    }
    if (!stored) setVisible(true);

    const onOpen = () => setVisible(true);
    window.addEventListener(COOKIE_OPEN_EVENT, onOpen);
    return () => window.removeEventListener(COOKIE_OPEN_EVENT, onOpen);
  }, []);

  const choose = (value: Choice) => {
    try {
      localStorage.setItem(KEY, value);
    } catch {
      /* private mode — fall back to the cookie only */
    }
    document.cookie = `${KEY}=${value}; path=/; max-age=${60 * 60 * 24 * 365}; samesite=lax`;
    setVisible(false);
  };

  if (!visible) return null;

  return (
    <div
      role="dialog"
      aria-modal="false"
      aria-label={labels.title}
      className="fixed inset-x-0 bottom-0 z-50 border-t border-line bg-void/95 backdrop-blur-sm"
    >
      <div className="mx-auto flex max-w-[1440px] flex-col gap-4 px-6 py-5 md:flex-row md:items-center md:justify-between md:px-10">
        <div className="max-w-2xl">
          <p className="font-heading text-sm font-bold text-white">
            {labels.title}
          </p>
          <p className="mt-1 text-xs leading-relaxed text-ink-muted">
            {labels.body}{" "}
            <Link
              href="/polityka-prywatnosci"
              className="text-silver underline underline-offset-2 hover:text-white"
            >
              {labels.privacy}
            </Link>
          </p>
        </div>
        <div className="flex shrink-0 gap-3">
          <button
            type="button"
            onClick={() => choose("essential")}
            className="label inline-flex h-11 items-center border border-line-strong px-5 text-xs text-white transition-colors hover:border-white hover:bg-white/5"
          >
            {labels.essential}
          </button>
          <button
            type="button"
            onClick={() => choose("all")}
            className="label inline-flex h-11 items-center bg-red px-6 text-xs text-white transition-colors hover:bg-red-hover"
          >
            {labels.acceptAll}
          </button>
        </div>
      </div>
    </div>
  );
}
