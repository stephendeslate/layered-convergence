// TRACED: FD-UI-CONFIG-001 — Next.js configuration with transpile packages
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@field-service-dispatch/shared'],
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
};

export default nextConfig;
