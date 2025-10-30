import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
    eslint: {
    ignoreDuringBuilds: true, // ✅ disables ESLint errors during build
  },
   typescript: {
    ignoreBuildErrors: true, // ✅ skip TypeScript validation
  },
  
};

export default nextConfig;
