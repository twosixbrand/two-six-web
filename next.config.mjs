import { withSentryConfig } from '@sentry/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          { key: 'X-Frame-Options', value: 'DENY' },
          { key: 'X-Content-Type-Options', value: 'nosniff' },
          { key: 'Referrer-Policy', value: 'strict-origin-when-cross-origin' },
          { key: 'Permissions-Policy', value: 'camera=(), microphone=(), geolocation=()' },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=63072000; includeSubDomains; preload',
          },
          {
            key: 'Content-Security-Policy',
            value: [
              "default-src 'self'",
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.wompi.co https://*.sentry.io https://www.googletagmanager.com https://www.google-analytics.com",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.digitaloceanspaces.com https://images.unsplash.com",
              "connect-src 'self' https://*.twosixweb.com https://api.twosixweb.com https://*.sentry.io https://checkout.wompi.co https://www.google-analytics.com https://production.wompi.co",
              "frame-src https://maps.google.com https://checkout.wompi.co",
            ].join('; '),
          },
        ],
      },
    ];
  },
  // La opción `turbopack.root` se usa para configurar el directorio raíz para Turbopack.
  // Esto es útil cuando Next.js infiere incorrectamente la raíz del proyecto, por ejemplo,
  // cuando hay múltiples archivos de bloqueo en los directorios padres.
  // Lo establecemos en `__dirname` para decirle explícitamente a Turbopack que la raíz del proyecto
  // es el directorio actual.
  turbopack: {
    root: __dirname,
  },
  eslint: {
    ignoreDuringBuilds: true,
  },
  typescript: {
    ignoreBuildErrors: true,
  },
  experimental: {
    // Limits the memory that Next.js will use for the web workers to 1 thread instead of CPU core count.
    workerThreads: false,
    cpus: 1,
  },
  webpack: (config, { isServer }) => {
    // Limitamos el paralelismo de Webpack al mínimo para ahorrar memoria
    config.parallelism = 1;
    return config;
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'example.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'twosix-catalog-storage.twosix-catalog-storage.atl1.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'twosix-catalog-storage.atl1.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
      {
        protocol: 'https',
        hostname: 'twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;
