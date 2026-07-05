import createMiddleware from "next-intl/middleware";
import { routing } from "./i18n/routing";

// Locale routing only. Security headers (incl. CSP) are applied in next.config.ts
// so they cover static responses too. See SECURITY.md for the CSP script-src TODO.
export default createMiddleware(routing);

export const config = {
  // Run on everything except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
