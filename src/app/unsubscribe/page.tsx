"use client";

import Link from "next/link";
import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function UnsubscribeContent() {
    const searchParams = useSearchParams();
    const status = searchParams?.get("status");

    return (
        <div className="flex flex-col items-center justify-center min-h-[70vh] px-4">
            <div className="bg-white p-10 rounded-2xl shadow-sm border border-border text-center max-w-lg w-full">
                {status === "success" ? (
                    <>
                        <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-green-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-primary mb-4 tracking-tight">¡Te has dado de baja!</h1>
                        <p className="text-muted-foreground text-lg mb-8">
                            Lamentamos verte partir. A partir de ahora ya no recibirás nuestros correos del <strong>Club Two Six</strong>.
                            Si en el futuro cambias de opinión, las puertas de nuestro Club siempre estarán abiertas para ti.
                        </p>
                    </>
                ) : (
                    <>
                        <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6">
                            <svg className="w-10 h-10 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-serif font-bold text-primary mb-4 tracking-tight">Algo salió mal</h1>
                        <p className="text-muted-foreground text-lg mb-8">
                            No pudimos procesar tu solicitud de baja. Por favor, asegúrate de haber usado el enlace completo del correo electrónico de suscripción.
                        </p>
                    </>
                )}

                <Link
                    href="/"
                    className="inline-block bg-primary text-secondary font-bold py-4 px-8 rounded-lg hover:bg-primary/90 transition-colors uppercase tracking-widest text-sm w-full"
                >
                    Volver a la Tienda
                </Link>
            </div>
        </div>
    );
}

export default function UnsubscribePage() {
    return (
        <div className="bg-secondary/20 min-h-screen pt-12 pb-16">
            <Suspense fallback={
                <div className="flex justify-center items-center min-h-[50vh]">
                    <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
                </div>
            }>
                <UnsubscribeContent />
            </Suspense>
        </div>
    );
}
