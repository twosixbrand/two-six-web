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
          <div className="flex flex-col space-y-5">
            <div className="w-full flex justify-center relative -left-4 md:-left-2">
              <Link href="/" className="inline-block transition-transform hover:scale-105">
                <Image
                  src="/logo-black.png"
                  alt="two-six-web Logo"
                  width={130}
                  height={50}
                  className="h-auto w-auto opacity-90 hover:opacity-100 transition-opacity"
                />
              </Link>
            </div>
            <p className="text-[13px] leading-relaxed text-secondary/70 font-light text-center">
              Redefiniendo el minimalismo moderno. Prendas atemporales diseñadas para destacar tu esencia y acompañarte en cada momento.
            </p>
            <p className="text-[11px] text-secondary/60 mt-1 flex items-center justify-center gap-2">
              📍 Envigado, Antioquia, Colombia
            </p>
            <div className="flex items-center justify-center space-x-6 pt-3">
              <SocialLink href="https://www.instagram.com/twosix.brand/" label="Instagram">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><rect width="20" height="20" x="2" y="2" rx="5" ry="5"/><path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/><line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/></svg>
              </SocialLink>
              <SocialLink href="https://www.tiktok.com/@twosix_brand" label="TikTok">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M9 12a4 4 0 1 0 4 4V4a5 5 0 0 0 5 5h-2a3 3 0 0 1-3-3v14a6 6 0 1 1-6-6v2a4 4 0 0 0 2 6.83"/></svg>
              </SocialLink>
              <SocialLink href="https://www.facebook.com/TwoSix" label="Facebook">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M18 2h-3a5 5 0 0 0-5 5v3H7v4h3v8h4v-8h3l1-4h-4V7a1 1 0 0 1 1-1h3z"/></svg>
              </SocialLink>
              <SocialLink href="https://wa.me/+573108777629" label="WhatsApp">
                <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"><path d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"/></svg>
              </SocialLink>
            </div>
          </div>

          {/* Columna 2: Colecciones */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary/80 mb-3">La Marca</h3>
            <FooterLink href="/sobre-nosotros" label="Nuestra Identidad" />
            <FooterLink href="/blog" label="Two Six Journal (Blog)" />

            <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary/80 mt-6 mb-3">Colecciones</h3>
            <FooterLink href="/man" label="Hombre" />
            <FooterLink href="/woman" label="Mujer" />
            <FooterLink href="/unisex" label="Unisex" />
            {showOutletLink && (
              <Link href="/outlet" className="text-[13px] text-red-400 hover:text-red-300 transition-colors w-fit font-light">
                Outlet Especial
              </Link>
            )}
          </div>

          {/* Columna 3: Asistencia & Legal */}
          <div className="flex flex-col space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary/80 mb-3">Asistencia & Legal</h3>
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
          <div className="flex flex-col space-y-3">
            <h3 className="text-xs font-semibold uppercase tracking-widest text-secondary/80 mb-3">Únete al Club</h3>
            <p className="text-[13px] text-secondary/70 font-light leading-relaxed">
              Suscríbete para recibir accesos anticipados, lanzamientos exclusivos y un 10% de descuento en tu primer pedido.
            </p>
            <form className="flex flex-col gap-3 mt-2" onSubmit={handleSubscribe}>
              <Input
                type="email"
                placeholder="Tu correo electrónico"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                disabled={status === 'loading'}
                className="bg-secondary/15 border border-accent/40 text-secondary placeholder:text-secondary/70 focus-visible:ring-accent transition-colors disabled:opacity-70 font-medium"
              />
              <Button type="submit" variant="default" disabled={status === 'loading'} className="w-full bg-accent text-primary hover:bg-accent/90 disabled:opacity-50 font-bold transition-all">
                {status === 'loading' ? (
                  <span className="flex items-center gap-2">
                    <svg className="animate-spin h-4 w-4" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" fill="none" />
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
                    </svg>
                    Suscribiendo...
                  </span>
                ) : 'Suscribirme'}
              </Button>
              {message && (
                <p className={`text-sm mt-1 font-medium ${status === 'success' ? 'text-green-400' : 'text-red-400'}`}>
                  {message}
                </p>
              )}
            </form>
            <div className="mt-4 p-3 bg-secondary/10 rounded-lg border border-secondary/20 flex items-center gap-3">
              <span className="relative flex h-3 w-3 shrink-0">
                <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-green-400 opacity-75"></span>
                <span className="relative inline-flex rounded-full h-3 w-3 bg-green-500"></span>
              </span>
              <p className="text-[12px] font-medium leading-tight text-secondary/90">
                Pagos 100% seguros procesados por Wompi (Grupo Bancolombia)
              </p>
            </div>
          </div>

        </div>

        {/* Separator and Copyright */}
        <div className="mt-16 pt-8 border-t border-secondary/10 flex flex-col items-center xl:flex-row xl:justify-between gap-8 xl:gap-6 text-xs text-secondary/50">
          <div className="flex flex-col items-center xl:items-start gap-4 order-2 xl:order-1">
            <p className="text-center xl:text-left">© {new Date().getFullYear()} T W O - S I X. Todos los derechos reservados.</p>
            <div className="flex flex-wrap gap-2 justify-center xl:justify-start mt-2 xl:mt-0">
              {['Visa', 'Mastercard', 'Amex', 'Nequi', 'Daviplata', 'PSE', 'Wompi'].map((method) => (
                <span key={method} className="min-w-[85px] h-7 flex justify-center items-center px-1 border border-secondary/20 rounded text-[9px] sm:text-[10px] uppercase tracking-widest text-secondary/60 bg-secondary/5 font-bold select-none transition-colors hover:border-secondary/40 hover:bg-secondary/10 hover:text-secondary/80">
                  {method}
                </span>
              ))}
            </div>
          </div>
          <div className="flex flex-wrap justify-center gap-4 items-center order-1 xl:order-2">
            <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer" className="hover:text-accent font-semibold transition-colors flex items-center gap-2">
              <span className="w-2 h-2 rounded-full bg-accent animate-pulse"></span>
              Superintendencia de Industria y Comercio (SIC)
            </a>
            <span className="hidden md:inline">·</span>
            <span>Envíos Nacionales</span>
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
  <a href={href} target="_blank" rel="noopener noreferrer" aria-label={label} className="text-secondary/60 hover:text-accent hover:scale-110 transition-all duration-300">
    {children}
  </a>
);

const FooterLink = ({ href, label }: { href: string; label: string }) => (
  <Link href={href} className="text-[13px] text-secondary/60 hover:text-accent font-light transition-colors w-fit">
    {label}
  </Link>
);

export default Footer;
