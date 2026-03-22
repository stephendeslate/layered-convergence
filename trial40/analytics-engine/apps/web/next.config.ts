// TRACED:AE-FE-01 — Next.js 15 config with transpilePackages for shared
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@analytics-engine/shared'],
  reactStrictMode: true,
};

export default nextConfig;
