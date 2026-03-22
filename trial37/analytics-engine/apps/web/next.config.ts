import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@analytics-engine/shared'],
  poweredByHeader: false,
};

export default nextConfig;
