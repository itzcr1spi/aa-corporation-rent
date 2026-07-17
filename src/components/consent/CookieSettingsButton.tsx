"use client";

import { COOKIE_OPEN_EVENT } from "./CookieConsent";

/** Re-opens the cookie banner from the footer so a choice can be changed. */
export function CookieSettingsButton({ label }: { label: string }) {
  return (
    <button
      type="button"
      onClick={() => window.dispatchEvent(new CustomEvent(COOKIE_OPEN_EVENT))}
      className="text-left transition-colors hover:text-white"
    >
      {label}
    </button>
  );
}
