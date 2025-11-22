import path from 'path';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));

/** @type {import('next').NextConfig} */
const nextConfig = {
  // La opción `turbopack.root` se usa para configurar el directorio raíz para Turbopack.
  // Esto es útil cuando Next.js infiere incorrectamente la raíz del proyecto, por ejemplo,
  // cuando hay múltiples archivos de bloqueo en los directorios padres.
  // Lo establecemos en `__dirname` para decirle explícitamente a Turbopack que la raíz del proyecto
  // es el directorio actual.
  turbopack: {
    root: __dirname,
  },
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'images.unsplash.com',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

export default nextConfig;