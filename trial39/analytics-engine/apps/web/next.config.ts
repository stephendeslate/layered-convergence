// TRACED:AE-FE-01 — Next.js configuration with transpilePackages
// TRACED:AE-ARCH-06 — Turbo tasks pipeline enables build/test/lint/typecheck
// TRACED:AE-ARCH-07 — Root packageManager pnpm@9.15.4 with turbo devDependency

import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@analytics-engine/shared'],
  reactStrictMode: true,
  poweredByHeader: false,
};

export default nextConfig;
