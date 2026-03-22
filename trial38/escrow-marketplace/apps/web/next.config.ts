import type { NextConfig } from 'next';

// TRACED: EM-FE-001 — Next.js 15 configuration with security headers
const nextConfig: NextConfig = {
  transpilePackages: ['@escrow-marketplace/shared'],
  headers: async () => [
    {
      source: '/:path*',
      headers: [
        { key: 'X-Frame-Options', value: 'DENY' },
        { key: 'X-Content-Type-Options', value: 'nosniff' },
        { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
      ],
    },
  ],
};

export default nextConfig;
