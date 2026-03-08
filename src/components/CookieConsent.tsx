"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";

export default function CookieConsent() {
    const [show, setShow] = useState<boolean>(false);
    const [isClient, setIsClient] = useState(false);

    useEffect(() => {
        setIsClient(true);
        // Verificamos en el almacenamiento local si ya aceptó
        const consent = localStorage.getItem("twoSixCookieConsent");
        if (!consent) {
            // Damos un pequeñísimo delay para que la transición de entrada sea apreciable
            const timer = setTimeout(() => {
                setShow(true);
            }, 500);
            return () => clearTimeout(timer);
        }
    }, []);

    const handleAccept = () => {
        // Registramos la aceptación para futuras visitas
        localStorage.setItem("twoSixCookieConsent", "true");
        setShow(false);
    };

    // Prevenimos discordancias de hidratación entre server y client
    if (!isClient) return null;

    return (
        <>
            {show && (
                <div className="fixed bottom-0 left-0 right-0 z-[100] px-4 pb-4 md:px-6 md:pb-6 pointer-events-none flex justify-center md:justify-end">
                    <div
                        className="pointer-events-auto w-full md:w-[420px] bg-primary/95 text-secondary backdrop-blur-xl border border-secondary/10 shadow-2xl p-6 rounded-2xl transform transition-all duration-700 ease-out translate-y-0 opacity-100"
                        style={{ animation: 'slideUpFade 0.7s cubic-bezier(0.16, 1, 0.3, 1)' }}
                    >
                        <div className="flex flex-col gap-4">
                            <div className="space-y-2">
                                <h3 className="font-serif text-lg tracking-wide flex items-center gap-2">
                                    <span className="w-2 h-2 rounded-full bg-accent animate-pulse inline-block"></span>
                                    Experiencia Two Six
                                </h3>
                                <p className="text-secondary/70 text-sm leading-relaxed font-light">
                                    Utilizamos cookies para garantizar la mejor experiencia en nuestra tienda, personalizar el contenido y analizar el tráfico. Al continuar navegando, aceptas nuestra política.
                                </p>
                            </div>
                            <div className="flex flex-col sm:flex-row gap-3 pt-2">
                                <Button
                                    onClick={handleAccept}
                                    className="w-full bg-accent text-primary hover:bg-accent/90 transition-all shadow-md uppercase tracking-wider text-xs font-semibold"
                                >
                                    Aceptar y Continuar
                                </Button>
                                <a
                                    href="/politicas/cookies"
                                    className="w-full sm:w-auto px-4 py-2 border border-secondary/20 hover:border-secondary/50 hover:bg-white/5 rounded-md transition-colors text-center uppercase tracking-wider text-xs font-semibold flex items-center justify-center shrink-0"
                                >
                                    Saber más
                                </a>
                            </div>
                        </div>
                    </div>
                    <style dangerouslySetInnerHTML={{
                        __html: `
            @keyframes slideUpFade {
              from { opacity: 0; transform: translateY(20px); }
              to { opacity: 1; transform: translateY(0); }
            }
          `}} />
                </div>
            )}
        </>
    );
}
