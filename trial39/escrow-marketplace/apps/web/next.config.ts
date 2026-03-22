// TRACED: EM-FE-001 — Next.js 15 configuration
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@escrow-marketplace/shared'],
  experimental: {
    serverActions: {
      bodySizeLimit: '1mb',
    },
  },
};

export default nextConfig;
