// TRACED: EM-NEXT-001
import type { NextConfig } from 'next';

const nextConfig: NextConfig = {
  transpilePackages: ['@escrow-marketplace/shared'],
};

export default nextConfig;
