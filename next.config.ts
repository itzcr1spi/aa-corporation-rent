import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const isDev = process.env.NODE_ENV !== "production";

/**
 * Content-Security-Policy.
 *
 * Every directive is locked down EXCEPT `script-src`, which currently allows
 * `'unsafe-inline'`. Reason: a nonce/hash-based script-src is the goal, but Next
 * 16.2's automatic nonce propagation does not emit `nonce=` on its framework
 * scripts here (verified — the CSP request header reaches the renderer but no
 * nonce is stamped), and hashing the RSC payload scripts is not viable. React's
 * output escaping remains the primary XSS defense, and the public pages render no
 * user-supplied HTML. TODO(security): move script-src to nonce/hash before the
 * authenticated/admin surfaces render user data (see SECURITY.md).
 *
 * Dev additionally needs `unsafe-eval` + a websocket for Turbopack HMR.
 */
const csp = [
  "default-src 'self'",
  `script-src 'self' 'unsafe-inline'${isDev ? " 'unsafe-eval'" : ""}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data: blob:",
  "font-src 'self'",
  `connect-src 'self'${isDev ? " ws: wss:" : ""}`,
  "object-src 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "frame-ancestors 'none'",
  ...(isDev ? [] : ["upgrade-insecure-requests"]),
].join("; ");

// Security headers applied to every response (static + dynamic). When we move off
// Vercel to Hetzner these must be re-asserted at the reverse proxy too — nothing
// here relies on a platform default except TLS/HSTS termination.
const securityHeaders = [
  { key: "Content-Security-Policy", value: csp },
  {
    key: "Strict-Transport-Security",
    value: "max-age=63072000; includeSubDomains; preload",
  },
  { key: "X-Frame-Options", value: "DENY" },
  { key: "X-Content-Type-Options", value: "nosniff" },
  { key: "Referrer-Policy", value: "strict-origin-when-cross-origin" },
  {
    key: "Permissions-Policy",
    value: "camera=(), microphone=(), geolocation=(), browsing-topics=()",
  },
  { key: "X-DNS-Prefetch-Control", value: "off" },
];

const nextConfig: NextConfig = {
  // Standalone output keeps us portable: works with `next start`, Docker, and a
  // future Hetzner box — no Vercel-proprietary runtime required.
  output: "standalone",
  poweredByHeader: false,
  images: {
    // Car photos and (later) signed document previews will be served from
    // S3-compatible object storage. Hosts get added here once STORAGE_* is set.
    remotePatterns: [],
  },
  async headers() {
    return [{ source: "/:path*", headers: securityHeaders }];
  },
};

export default withNextIntl(nextConfig);
