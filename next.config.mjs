import { withSentryConfig } from '@sentry/nextjs';
import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  output: "standalone",
  poweredByHeader: false,
  async redirects() {
    return [
      {
        source: '/about',
        destination: '/sobre-nosotros',
        permanent: true,
      },
      {
        source: '/guia-tallas',
        destination: '/guia-tallas-camisetas',
        permanent: true,
      },
    ];
  },
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
              "script-src 'self' 'unsafe-inline' 'unsafe-eval' https://checkout.wompi.co https://*.sentry.io https://www.googletagmanager.com https://www.google-analytics.com https://apis.google.com https://connect.facebook.net https://www.facebook.com",
              "worker-src 'self' blob:",
              "style-src 'self' 'unsafe-inline' https://fonts.googleapis.com",
              "font-src 'self' https://fonts.gstatic.com",
              "img-src 'self' data: blob: https://*.digitaloceanspaces.com https://images.unsplash.com https://www.facebook.com",
              `connect-src 'self' ${process.env.NODE_ENV === 'development' ? 'http://localhost:3050' : ''} https://twosix-backend-z6y5k.ondigitalocean.app https://*.twosixweb.com https://api.twosixweb.com https://*.sentry.io https://checkout.wompi.co https://www.google-analytics.com https://production.wompi.co https://www.facebook.com`,
              "frame-src https://maps.google.com https://www.google.com https://checkout.wompi.co",
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
    // Only ESLint falls back to warnings due to 130+ test-suite issues. TS strict types are purely enforced. (MED-04)
    ignoreDuringBuilds: true,
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
    unoptimized: true,
    qualities: [60, 65, 75, 90, 100],
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
