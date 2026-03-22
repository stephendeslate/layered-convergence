// TRACED:AE-NEXT-CONFIG
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@analytics-engine/shared'],
  reactStrictMode: true,
};

export default nextConfig;
