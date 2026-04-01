import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: "standalone",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
      },
      {
        protocol: 'https',
        hostname: 'twosix-catalog-storage.atl1.digitaloceanspaces.com',
      },
      {
        protocol: 'https',
        hostname: 'twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com',
      },
    ],
  },
  eslint: {
    // Warning: This allows production builds to successfully complete even if your project has ESLint errors.
    ignoreDuringBuilds: true,
  },
  typescript: {
    // !! WARN !! Dangerously allow production builds to successfully complete even if your project has type errors.
    ignoreBuildErrors: true,
  },
  productionBrowserSourceMaps: false,
  experimental: {
    cpus: 1,
    workerThreads: false,
    memoryBasedWorkersCount: true,
  },
};

export default nextConfig;
