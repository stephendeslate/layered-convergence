import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: '2mb',
    },
  },
  env: {
    API_URL: process.env.API_URL ?? 'http://localhost:3000',
  },
};

export default nextConfig;
