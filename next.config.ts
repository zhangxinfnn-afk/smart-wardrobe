import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  // Prisma 需要作为外部包（不被打包进 bundle）
  serverExternalPackages: ['@prisma/client', 'prisma'],
};

export default nextConfig;
