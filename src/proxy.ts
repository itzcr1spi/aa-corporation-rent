import createMiddleware from "next-intl/middleware";
import { NextResponse, type NextRequest } from "next/server";
import { routing } from "./i18n/routing";

const handleI18nRouting = createMiddleware(routing);

// Auth.js session cookie names (dev + prod-secure variants).
const SESSION_COOKIES = [
  "authjs.session-token",
  "__Secure-authjs.session-token",
];

export default function proxy(request: NextRequest) {
  const { pathname } = request.nextUrl;

  // First-layer admin guard: no session cookie → bounce to login. This is defense
  // in depth only; the AUTHORITATIVE check is `auth()` in the admin layout and in
  // every admin server action (a cookie presence check is not verification).
  if (pathname.startsWith("/admin") && !pathname.startsWith("/admin/login")) {
    const hasSession = SESSION_COOKIES.some((c) => request.cookies.has(c));
    if (!hasSession) {
      const url = request.nextUrl.clone();
      url.pathname = "/admin/login";
      url.search = "";
      return NextResponse.redirect(url);
    }
  }

  return handleI18nRouting(request);
}

export const config = {
  // Run on everything except API routes, Next internals, and static files.
  matcher: ["/((?!api|_next|_vercel|.*\\..*).*)"],
};
