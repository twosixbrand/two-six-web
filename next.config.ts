import type { NextConfig } from "next";

const nextConfig: NextConfig = {
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
};

export default nextConfig;
