import Link from "next/link";
import Image from "next/image";

const Footer = () => {
  return (
    <footer className="bg-primary text-white mt-16">
      <div className="container mx-auto px-8 py-12">
        <div className="grid md:grid-cols-3 gap-8 text-center md:text-left">
          {/* Columna 1: Logo y Redes Sociales */}
          <div className="flex flex-col items-center">
            <Link href="/">
              <Image
                src="/logo-black.png" // Asumiendo que tienes una versión blanca del logo
                alt="two-six-web Logo"
                width={140}
                height={45}
                className="h-auto w-auto"
              />
            </Link>
            <div className="flex justify-center md:justify-start mt-6 space-x-6">
              <SocialLink
                href="https://www.facebook.com/share/17Xesk5dkT/?mibextid=wwXIfr"
                label="Facebook"
              >
                <Image
                  src="/facebook.svg"
                  alt="Facebook"
                  width={24}
                  height={24}
                  className="text-white/80 group-hover:text-accent"
                />
              </SocialLink>
              <SocialLink
                href="https://instagram.com/twosix.brand/"
                label="Instagram"
              >
                <Image
                  src="/instagram.svg"
                  alt="Instagram"
                  width={24}
                  height={24}
                  className="text-white/80 group-hover:text-accent"
                />
              </SocialLink>
              <SocialLink
                href="https://tiktok.com/@twosix_brand"
                label="TikTok"
              >
                <Image
                  src="/tiktok.svg"
                  alt="Tiktok"
                  width={24}
                  height={24}
                  className="text-white/80 group-hover:text-accent"
                />
              </SocialLink>
              <SocialLink href="https://wa.me/+573108777629" label="WhatsApp">
                <Image
                  src="/whatsApp.svg"
                  alt="WhatsApp"
                  width={24}
                  height={24}
                  className="text-white/80 group-hover:text-accent"
                />
              </SocialLink>
              <SocialLink
                href="https://www.youtube.com/@twosix-brand"
                label="Youtube"
              >
                <Image
                  src="/youtube.svg"
                  alt="Youtube"
                  width={24}
                  height={24}
                  className="text-white/80 group-hover:text-accent"
                />
              </SocialLink>
              <SocialLink
                href="https://x.com/twosix_bran"
                label="X"
              >
                <Image
                  src="/x.svg"
                  alt="X"
                  width={24}
                  height={24}
                  className="text-white/80 group-hover:text-accent"
                />
              </SocialLink>
              <SocialLink
                href="https://x.com/twosix_bran"
                label="Pinterest"
              >
                <Image
                  src="/pinterest.svg"
                  alt="Pinterest"
                  width={24}
                  height={24}
                  className="text-white/80 group-hover:text-accent"
                />
              </SocialLink>
            </div>
          </div>

          {/* Columna 2: Navegación */}
          <div className="flex flex-col space-y-2">
            <h3 className="font-bold text-lg mb-2">Navegación</h3>
            <Link
              href="/man"
              className="text-white/80 hover:text-accent transition-colors"
            >
              Hombre
            </Link>
            <Link
              href="/woman"
              className="text-white/80 hover:text-accent transition-colors"
            >
              Mujer
            </Link>
             <Link
              href="/unisex"
              className="text-white/80 hover:text-accent transition-colors"
            >
              Unisex
            </Link>
            <Link
              href="/about"
              className="text-white/80 hover:text-accent transition-colors"
            >
              Nosotros
            </Link>
            <Link
              href="/contact"
              className="text-white/80 hover:text-accent transition-colors"
            >
              Contacto
            </Link>
          </div>

          {/* Columna 3: Legal */}
          <div className="flex flex-col space-y-2">
            <h3 className="font-bold text-lg mb-2">Legal</h3>
            <Link
              href="/privacy-policy"
              className="text-white/80 hover:text-accent transition-colors"
            >
              Política de Privacidad
            </Link>
            <Link
              href="/terms-of-service"
              className="text-white/80 hover:text-accent transition-colors"
            >
              Términos de Servicio
            </Link>
          </div>
        </div>

        <hr className="my-8 border-white/20" />

        <p className="text-center text-sm text-white/60">
          © {new Date().getFullYear()} two-six-web. Todos los derechos
          reservados.
        </p>
      </div>
    </footer>
  );
};

const SocialLink = ({
  href,
  label,
  children,
}: {
  href: string;
  label: string;
  children: React.ReactNode;
}) => (
  <a
    href={href}
    target="_blank"
    rel="noopener noreferrer"
    aria-label={label}
    className="text-white/80 hover:text-accent transition-colors"
  >
    {children}
  </a>
);

export default Footer;
