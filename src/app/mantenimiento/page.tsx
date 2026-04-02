"use client";

import Image from 'next/image';
import { useEffect } from 'react';

export default function MaintenancePage() {
  useEffect(() => {
    // Polling silencioso: El navegador intentará refrescar la página subyacente cada 30 segundos.
    // Tan pronto como la variable de DigitalOcean sea `false`, el Middleware dejará pasar 
    // la petición y el usuario verá la tienda nuevamente de forma automática.
    const interval = setInterval(() => {
      window.location.reload();
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  return (
    <div className="min-h-screen bg-[#0a0a0a] flex flex-col items-center justify-center p-6 text-center relative overflow-hidden">
      {/* Background ambient lighting */}
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-[#d4af37] opacity-[0.05] rounded-full blur-[120px] pointer-events-none"></div>

      <div className="z-10 flex flex-col items-center max-w-2xl mx-auto space-y-14">
        {/* Logo Container con brillo elegante */}
        <div className="relative group">
          <div className="absolute -inset-6 bg-gradient-to-r from-[#b8962e] to-[#ecc95a] opacity-10 blur-xl transition duration-1000 -z-10 rounded-full animate-pulse"></div>
          <Image
            src="/logo.png"
            alt="Two Six Logo"
            width={240}
            height={90}
            className="object-contain drop-shadow-2xl"
            priority
          />
        </div>

        {/* Text Content */}
        <div className="space-y-6">
          <h1 className="text-3xl md:text-5xl font-black tracking-widest text-[#ececec] uppercase" style={{ textShadow: '0 0 40px rgba(212,175,55,0.1)' }}>
            Elevando la <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#d4af37] via-[#fce688] to-[#d4af37]">Experiencia</span>
          </h1>
          <p className="text-base md:text-lg text-[#888888] font-light max-w-lg mx-auto leading-relaxed">
            Nuestra plataforma se encuentra en un proceso de actualización para ofrecerte un nivel superior y mejor rendimiento. <br className="hidden md:block" />
            <strong className="text-gray-300 font-normal mt-2 block">Estaremos de vuelta en breves momentos.</strong>
          </p>
        </div>

        {/* Separador */}
        <div className="w-16 h-[2px] bg-gradient-to-r from-transparent via-[#d4af37] to-transparent opacity-40"></div>

        {/* Footer info / Disclaimer */}
        <div className="flex flex-col items-center space-y-3">
          <p className="text-xs md:text-sm tracking-[0.3em] text-[#d4af37] uppercase font-bold drop-shadow-sm">
            CRAFTED FOR REAL ONES
          </p>
          <p className="text-[11px] text-[#444] font-medium tracking-wide">
            © {new Date().getFullYear()} TWO SIX S.A.S. - COMPRAS EN PAUSA POR ACTUALIZACIÓN
          </p>
        </div>
      </div>
    </div>
  );
}
