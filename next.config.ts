import type { NextConfig } from "next";
import createNextIntlPlugin from "next-intl/plugin";

const withNextIntl = createNextIntlPlugin();

const nextConfig: NextConfig = {
  // Standalone output keeps us portable: works with `next start`, Docker, and a
  // future Hetzner box — no Vercel-proprietary runtime required.
  output: "standalone",
  images: {
    // Car photos and (later) signed document previews will be served from
    // S3-compatible object storage. Hosts get added here once STORAGE_* is set.
    remotePatterns: [],
  },
};

export default withNextIntl(nextConfig);
