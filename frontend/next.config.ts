import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Simple configuration - Next.js has clean URLs by default
  trailingSlash: false,
  compress: true,
  poweredByHeader: false,
};

export default nextConfig;
