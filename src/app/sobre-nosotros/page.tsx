import type { Metadata } from 'next';
import Image from "next/image";
import Link from "next/link";

export const metadata: Metadata = {
    title: 'Sobre Nosotros',
    description: 'Conoce Two Six: ropa colombiana diseñada y confeccionada en Medellín. Crafted for real ones. Calidad, resistencia y diseño urbano.',
    alternates: { canonical: '/sobre-nosotros' },
    openGraph: {
        title: 'Sobre Nosotros | Two Six',
        description: 'Nuestra Identidad. Crafted for real ones. Diseñado y confeccionado en Medellín, Colombia.',
        url: '/sobre-nosotros',
    },
};

export default function SobreNosotrosPage() {
    return (
        <div className="bg-secondary/10 min-h-screen pt-32 pb-24 selection:bg-accent/30 selection:text-primary">
            <div className="container mx-auto px-6 max-w-4xl">

                {/* Encabezado */}
                <div className="text-center mb-16 animate-in slide-in-from-bottom-8 duration-700 ease-out fade-in fill-mode-both">
                    <span className="text-sm tracking-widest uppercase text-accent font-semibold mb-4 block">
                        Crafted for real ones
                    </span>
                    <h1 className="text-4xl md:text-6xl font-serif font-bold text-primary tracking-tight mb-6">
                        Nuestra Identidad
                    </h1>
                    <div className="w-24 h-1 bg-accent mx-auto"></div>
                </div>

                {/* Contenido Principal */}
                <div className="grid grid-cols-1 md:grid-cols-12 gap-12 items-start mt-12 bg-white p-8 md:p-12 rounded-3xl shadow-xl shadow-primary/5 animate-in slide-in-from-bottom-12 duration-1000 ease-out fade-in fill-mode-both delay-150">

                    <div className="md:col-span-7 space-y-8 text-primary/80">
                        {/* Introducción */}
                        <section className="space-y-4">
                            <p className="text-lg md:text-xl leading-relaxed font-medium text-primary">
                                En Two Six, no solo creamos ropa; fabricamos piezas diseñadas para quienes viven la cultura urbana con autenticidad.
                            </p>
                            <p className="leading-relaxed">
                                Nuestra filosofía es simple: <strong className="text-primary font-semibold">Crafted for real ones.</strong> Creemos en la ropa que aguanta el ritmo de la calle sin perder el estilo.
                            </p>
                        </section>

                        {/* Orgullo Local */}
                        <section className="space-y-4 border-l-4 border-accent pl-6 py-2">
                            <h2 className="text-2xl font-serif font-semibold text-primary">Orgullo Local: Hecho en Medellín</h2>
                            <p className="leading-relaxed">
                                Cada una de nuestras prendas nace en el corazón de Medellín, Colombia. Nos enorgullece decir que trabajamos de la mano con talento local, garantizando procesos de confección de alta calidad y materiales seleccionados (como nuestro algodón de alto gramaje) que aseguran durabilidad en cada costura.
                            </p>
                        </section>

                        {/* Nuestra Promesa */}
                        <section className="space-y-4">
                            <h2 className="text-2xl font-serif font-semibold text-primary">Nuestra Promesa</h2>
                            <p className="leading-relaxed">
                                <strong className="text-primary font-medium">Calidad, resistencia y diseño.</strong> Al elegir Two Six, estás apoyando la industria nacional y llevando contigo una prenda pensada, cortada y cosida con precisión artesanal en la ciudad de la eterna primavera.
                            </p>
                        </section>
                    </div>

                    {/* Columna Derecha: Imagen / Decoración */}
                    <div className="md:col-span-5 flex flex-col items-center justify-center space-y-8 bg-secondary/30 p-8 rounded-2xl h-full border border-secondary/50">
                        <div className="relative w-48 h-48 md:w-56 md:h-56 mix-blend-multiply opacity-90 drop-shadow-2xl">
                            <Image
                                src="/logo-black.png"
                                alt="Two Six Logo"
                                fill
                                className="object-contain filter hover:scale-105 transition-transform duration-700"
                            />
                        </div>

                        <div className="text-center space-y-3">
                            <p className="text-sm font-medium text-primary/70 italic">
                                El logo representa la fuerza y la presencia de quienes usan la marca.
                            </p>
                            <div className="inline-block px-4 py-2 bg-primary text-secondary text-sm font-semibold tracking-widest uppercase mt-4">
                                Desde Medellín para el mundo
                            </div>
                        </div>
                    </div>

                </div>

                {/* CTA */}
                <div className="text-center mt-20 animate-in slide-in-from-bottom-8 duration-700 ease-out fade-in fill-mode-both delay-300">
                    <Link href="/catalog" className="inline-block px-10 py-4 bg-primary text-secondary uppercase tracking-widest text-sm font-medium hover:bg-accent hover:text-primary transition-all duration-300 shadow-xl hover:shadow-accent/20">
                        Explorar Colecciones
                    </Link>
                </div>

            </div>
        </div>
    );
}
