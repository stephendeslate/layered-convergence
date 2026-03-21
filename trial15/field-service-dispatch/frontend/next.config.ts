import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  experimental: {
    serverActions: {
      bodySizeLimit: "2mb",
    },
  },
  env: {
    API_BASE_URL: process.env.API_BASE_URL ?? "http://localhost:3001",
    WS_BASE_URL: process.env.WS_BASE_URL ?? "ws://localhost:3001",
  },
};

export default nextConfig;
