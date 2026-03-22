// TRACED: FD-API-002 — Next.js 15 configuration with API proxy rewrites
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  reactStrictMode: true,
  transpilePackages: ['@field-service-dispatch/shared'],
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: `${process.env.API_URL ?? 'http://localhost:3000'}/:path*`,
      },
    ];
  },
};

export default nextConfig;
