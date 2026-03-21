import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@field-service/shared'],
  output: 'standalone',
};

export default nextConfig;
