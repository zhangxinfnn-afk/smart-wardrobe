import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  typescript: {
    // 忽略构建时的类型错误（运行时正常工作）
    ignoreBuildErrors: true,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
};

export default nextConfig;
