import Link from 'next/link';
import Image from 'next/image';

interface FooterProps {
  showOutletLink: boolean;
}

const Footer = ({ showOutletLink }: FooterProps) => {
  return (
    <footer className="bg-white mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/">
            <Image
              src="/logo.png"
              alt="two-six-web Logo"
              width={120}
              height={40}
              className="h-auto w-auto"
            />
          </Link>

          <div className="flex justify-center mt-4">
            <Link
              href="/man"
              className="mx-4 text-sm text-primary/80 hover:text-accent"
            >
              Hombre
            </Link>
            <Link
              href="/woman"
              className="mx-4 text-sm text-primary/80 hover:text-accent"
            >
              Mujer
            </Link>
            {showOutletLink && (
              <Link
                href="/outlet"
                className="mx-4 text-sm text-primary/80 hover:text-accent"
              >
                Outlet
              </Link>
            )}
            <Link
              href="/about"
              className="mx-4 text-sm text-primary/80 hover:text-accent"
            >
              Nosotros
            </Link>

            <Link
              href="/contact"
              className="mx-4 text-sm text-primary/80 hover:text-accent"
            >
              Contacto
            </Link>
          </div>

          {/* --- Iconos de Redes Sociales --- */}
          <div className="flex justify-center mt-6 space-x-6">
            <a
              href="https://facebook.com"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Facebook"
              className="text-primary/80 hover:text-accent transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M22 12c0-5.523-4.477-10-10-10S2 6.477 2 12c0 4.991 3.657 9.128 8.438 9.878v-6.987h-2.54V12h2.54V9.797c0-2.506 1.492-3.89 3.777-3.89 1.094 0 2.238.195 2.238.195v2.46h-1.26c-1.243 0-1.63.771-1.63 1.562V12h2.773l-.443 2.89h-2.33v6.988C18.343 21.128 22 16.991 22 12z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://instagram.com/twosix.brand/"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Instagram"
              className="text-primary/80 hover:text-accent transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path
                  fillRule="evenodd"
                  d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.85s-.011 3.584-.069 4.85c-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07s-3.584-.012-4.85-.07c-3.252-.148-4.771-1.691-4.919-4.919-.058-1.265-.069-1.645-.069-4.85s.011-3.584.069-4.85c.149-3.225 1.664-4.771 4.919-4.919C8.416 2.175 8.796 2.163 12 2.163zm0 1.802c-3.143 0-3.505.012-4.73.068-2.763.126-3.953 1.317-4.08 4.08-.056 1.225-.067 1.586-.067 4.73s.011 3.505.067 4.73c.127 2.763 1.317 3.953 4.08 4.08 1.225.056 1.586.067 4.73.067s3.505-.011 4.73-.067c2.763-.127 3.953-1.317 4.08-4.08.056-1.225.067-1.586.067-4.73s-.011-3.505-.067-4.73c-.127-2.763-1.317-3.953-4.08-4.08-1.225-.056-1.586-.068-4.73-.068zm0 3.188c-2.649 0-4.795 2.146-4.795 4.795s2.146 4.795 4.795 4.795 4.795-2.146 4.795-4.795-2.146-4.795-4.795-4.795zm0 7.792c-1.657 0-3-1.343-3-3s1.343-3 3-3 3 1.343 3 3-1.343 3-3 3zm6.406-7.194c-.796 0-1.441.645-1.441 1.441s.645 1.441 1.441 1.441 1.441-.645 1.441-1.441-.645-1.441-1.441-1.441z"
                  clipRule="evenodd"
                />
              </svg>
            </a>
            <a
              href="https://tiktok.com/@twosix_brand"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="TikTok"
              className="text-primary/80 hover:text-accent transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.525.02c1.31-.02 2.61-.01 3.91-.02.08 1.53.63 3.09 1.75 4.17 1.12 1.11 2.7 1.62 4.24 1.79v4.03c-1.44-.05-2.89-.35-4.2-.97-.01-1.58-.01-3.18-.01-4.75-.25 0-.5 0-.76 0-1.96 0-3.47 1.62-3.47 3.47 0 1.92 1.51 3.47 3.47 3.47.04 0 .08 0 .12 0a3.48 3.48 0 003.36-3.47c0-.01 0-.02 0-.04.01 2.2 1.01 4.2 2.56 5.66-1.39 1.2-3.14 1.9-5.04 1.9-3.36 0-6.1-2.73-6.1-6.1 0-3.37 2.74-6.1 6.1-6.1.04 0 .08 0 .12 0z" />
              </svg>
            </a>
            <a
              href="https://pin.it/1CL2oGqYO"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="Pinterest"
              className="text-primary/80 hover:text-accent transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12 2C6.477 2 2 6.477 2 12c0 4.237 2.636 7.855 6.356 9.312-.088-.791-.167-2.005.035-2.868.182-.78 1.172-4.97 1.172-4.97s-.299-.6-.299-1.486c0-1.39.806-2.428 1.81-2.428.852 0 1.264.64 1.264 1.408 0 .858-.545 2.14-.828 3.33-.236.995.5 1.807 1.48 1.807 1.778 0 3.144-1.874 3.144-4.58 0-2.393-1.72-4.068-4.177-4.068-2.845 0-4.515 2.135-4.515 4.34 0 .859.331 1.781.745 2.281a.3.3 0 01.069.288l-.278 1.133c-.044.183-.145.223-.335.134-1.249-.581-2.03-2.407-2.03-3.874 0-3.154 2.292-6.052 6.608-6.052 3.469 0 6.165 2.473 6.165 5.776 0 3.447-2.173 6.22-5.19 6.22-1.013 0-1.965-.527-2.291-1.148l-.623 2.378c-.226.869-.835 1.958-1.244 2.621.937.29 1.931.446 2.96.446 5.523 0 10-4.477 10-10S17.523 2 12 2z" />
              </svg>
            </a>
            <a
              href="https://youtube.com/@twosix-brand"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="YouTube"
              className="text-primary/80 hover:text-accent transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M21.582 7.643A2.46 2.46 0 0019.86 6.01C18.13 5.5 12 5.5 12 5.5s-6.13 0-7.86.51a2.46 2.46 0 00-1.722 1.633C2 9.363 2 12 2 12s0 2.637.418 4.357a2.46 2.46 0 001.722 1.633C6.13 18.5 12 18.5 12 18.5s6.13 0 7.86-.51a2.46 2.46 0 001.722-1.633C22 14.637 22 12 22 12s0-2.637-.418-4.357zM9.75 14.5V9.5l4.5 2.5-4.5 2.5z" />
              </svg>
            </a>
            <a
              href="https://wa.me/3013975582"
              target="_blank"
              rel="noopener noreferrer"
              aria-label="WhatsApp"
              className="text-primary/80 hover:text-accent transition-colors"
            >
              <svg className="w-6 h-6" fill="currentColor" viewBox="0 0 24 24">
                <path d="M12.04 2c-5.46 0-9.91 4.45-9.91 9.91 0 1.75.46 3.45 1.32 4.95L2 22l5.25-1.38c1.45.79 3.08 1.21 4.79 1.21h.01c5.46 0 9.91-4.45 9.91-9.91s-4.45-9.91-9.91-9.91zM12.04 20.15h-.01c-1.5 0-2.96-.4-4.24-1.14l-.3-.18-3.15.82.84-3.08-.2-.32a8.03 8.03 0 01-1.22-4.38c0-4.42 3.6-8.02 8.02-8.02s8.02 3.6 8.02 8.02-3.6 8.02-8.02 8.02zm4.53-6.13c-.27-.13-1.59-.78-1.84-.87-.25-.09-.43-.13-.62.13-.19.26-.7.87-.86 1.04-.16.17-.32.19-.59.06-.27-.13-1.14-.42-2.17-1.33-.81-.71-1.36-1.59-1.52-1.86-.16-.27-.02-.42.12-.55.12-.12.27-.3.4-.4.13-.1.17-.17.25-.28.08-.11.04-.21-.02-.34s-.62-1.49-.85-2.04c-.23-.55-.46-.48-.62-.48h-.5c-.16 0-.43.06-.62.3.19.23-.7 2.12-.7 2.12s-.7 2.44.7 4.8c1.4 2.36 3.43 3.01 3.91 3.2.48.19.91.16 1.26.1.39-.06 1.59-1.04 1.81-1.45.22-.41.22-.76.16-.89z" />
              </svg>
            </a>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} two-six-web. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;