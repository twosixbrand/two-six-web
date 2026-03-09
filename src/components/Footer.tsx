"use client";

import Link from "next/link";
import Image from "next/image";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";

// 1. Definir la interfaz para las props del componente
interface FooterProps {
  showOutletLink: boolean;
}

const Footer = ({ showOutletLink }: FooterProps) => {
  const [email, setEmail] = useState("");
  const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
  const [message, setMessage] = useState("");

  const handleSubscribe = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!email) {
      setMessage("Por favor ingresa tu correo");
      setStatus('error');
      return;
    }

    setStatus('loading');
    setMessage("");

    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/newsletter/subscribe`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email }),
      });

      const data = await response.json();

      if (response.ok) {
        setStatus('success');
        setMessage(data.message || "¡Gracias por suscribirte al Club Two Six!");
        setEmail("");
      } else {
        setStatus('error');
        setMessage(data.message || "Hubo un error al suscribirte.");
      }
    } catch (error) {
      console.error("Newsletter subscription error:", error);
      setStatus('error');
      setMessage("Ocurrió un error inesperado, intenta de nuevo.");
    }
  };

  return (
    <footer className="bg-primary text-secondary/90 mt-16 pb-8 border-t border-accent/20">
      <div className="container mx-auto px-6 pt-16 pb-8">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-12 lg:gap-8">

          {/* Columna 1: Brand & Manifesto */}
          <div className="flex flex-col space-y-6">
            <Link href="/" className="inline-block">
              <Image
                src="/logo-black.png" // Idealmente logo invertido/blanco o dorado para el fondo oscuro
                alt="two-six-web Logo"
                width={120}
                height={40}
                className="h-auto w-auto opacity-90 hover:opacity-100 transition-opacity"
              />
            </Link>
            <p className="text-sm leading-relaxed text-secondary/70">
              Redefiniendo el minimalismo moderno. Prendas atemporales diseñadas para destacar tu esencia y acompañarte en cada momento.
            </p>
            <div className="flex items-center space-x-4 pt-2">
              <SocialLink href="https://instagram.com/twosix.brand/" label="Instagram">
                <Image src="/instagram.svg" alt="Instagram" width={20} height={20} className="opacity-70 hover:opacity-100 transition-opacity filter invert" />
              </SocialLink>
              <SocialLink href="https://tiktok.com/@twosix_brand" label="TikTok">
                <Image src="/tiktok.svg" alt="Tiktok" width={20} height={20} className="opacity-70 hover:opacity-100 transition-opacity filter invert" />
              </SocialLink>
              <SocialLink href="https://wa.me/+573108777629" label="WhatsApp">
                <Image src="/whatsapp.svg" alt="WhatsApp" width={20} height={20} className="opacity-70 hover:opacity-100 transition-opacity filter invert" />
              </SocialLink>
            </div>
          </div>

          {/* Columna 2: Colecciones */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-serif text-lg text-secondary mb-2 tracking-wide">La Marca</h3>
            <FooterLink href="/sobre-nosotros" label="Nuestra Identidad" />

            <h3 className="font-serif text-lg text-secondary mt-4 mb-2 tracking-wide">Colecciones</h3>
            <FooterLink href="/man" label="Hombre" />
            <FooterLink href="/woman" label="Mujer" />
            <FooterLink href="/unisex" label="Unisex" />
            {showOutletLink && (
              <Link href="/outlet" className="text-sm text-red-400 hover:text-red-300 transition-colors w-fit">
                Outlet Especial
              </Link>
            )}
          </div>

          {/* Columna 3: Asistencia & Legal */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-serif text-lg text-secondary mb-2 tracking-wide">Asistencia & Legal</h3>
            <FooterLink href="/guia-tallas-camisetas" label="Guía de Tallas (Camisetas)" />
            <FooterLink href="/tracking" label="Rastrear Pedido" />
            <FooterLink href="/pqr" label="Radicar PQR / Retracto" />
            <FooterLink href="/contact" label="Contacto" />
            <FooterLink href="/politicas/envios-y-entregas" label="Envíos y Entregas" />
            <FooterLink href="/politicas/cambios-y-retracto" label="Cambios y Retracto" />
            <FooterLink href="/politicas/privacidad" label="Política de Privacidad" />
            <FooterLink href="/legal/terminos-y-condiciones" label="Términos y Condiciones" />
            <FooterLink href="/politicas/cookies" label="Política de Cookies" />
          </div>

          {/* Columna 4: Newsletter (Shadcn UI) */}
          <div className="flex flex-col space-y-4">
            <h3 className="font-serif text-lg text-secondary mb-2 tracking-wide">Únete al Club</h3>
            <p className="text-sm text-secondary/70">
              Suscríbete para recibir accesos anticipados, lanzamientos exclusivos y un 10% de descuento en tu primer pedido.
            </p>
            <form className="flex flex-col gap-3 mt-2" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="bg-secondary/10 border-none text-secondary placeholder:text-secondary/50 focus-visible:ring-accent"
              />
              <Button type="submit" variant="default" disabled={status === 'loading'} className="w-full bg-accent text-primary hover:bg-accent/90 disabled:opacity-50">
                {status === 'loading' ? 'Suscribiendo...' : 'Suscribirme'}
              </Button>
              {message && (
                <p className={`text-sm mt-1 ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </form>
          </div>

        </div>

        {/* Separator and Copyright */}
        <div className="mt-16 pt-8 border-t border-secondary/10 flex flex-col items-center xl:flex-row xl:justify-between gap-6 text-xs text-secondary/50">
          <p className="text-center xl:text-left">© {new Date().getFullYear()} T W O - S I X. Todos los derechos reservados.</p>
          <div className="flex flex-wrap justify-center gap-4 items-center">
            <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="hover:text-accent font-semibold transition-colors flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Superintendencia de Industria y Comercio (SIC)
            </a>
            <span className="hidden md:inline">·</span>
            <span>Envios Nacionales</span>
            <span className="hidden md:inline">·</span>
            <span>Pagos Seguros</span>
          </div>
        </div>
      </div>
    </footer>
  );
};

// Componentes estéticos de ayuda
const SocialLink = ({ href, label, children }: { href: string; label: string; children: React.ReactNode }) => (
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-secondary/70 hover:text-accent transition-colors">
    {children}
  </a>
);

const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <Link href={href} className="text-sm text-secondary/70 hover:text-accent transition-colors w-fit">
    {label}
  </Link>
);

export default Footer;
