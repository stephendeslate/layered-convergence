import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@analytics-engine/shared'],
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
};

export default nextConfig;
