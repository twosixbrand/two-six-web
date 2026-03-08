// src/app/guia-tallas-camisetas/page.tsx
"use client";

import Image from "next/image";
import Link from "next/link";
import { ArrowLeft, Ruler } from "lucide-react";

export default function GuiaTallasCamisetasPage() {
    return (
        <div className="bg-gray-50 min-h-screen">
            {/* Header / Hero */}
            <div className="bg-primary text-white py-16 md:py-24 relative overflow-hidden">
                <div className="absolute inset-0 bg-gradient-to-r from-black/80 to-transparent z-10"></div>

                {/* Opcional: Imagen de fondo abstracta o textura */}
                <div className="absolute inset-0 opacity-20 bg-[url('https://www.transparenttextures.com/patterns/carbon-fibre.png')]"></div>

                <div className="container mx-auto px-4 relative z-20">
                    <Link href="/man" className="inline-flex items-center text-sm text-gray-300 hover:text-white mb-6 transition-colors">
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Volver a la tienda
                    </Link>
                    <h1 className="text-4xl md:text-5xl font-serif font-bold mb-4 tracking-wide flex items-center gap-3">
                        <Ruler className="w-8 h-8 md:w-10 md:h-10 text-accent" />
                        Guía de Tallas
                    </h1>
                    <p className="text-lg text-gray-300 max-w-2xl font-light">
                        Encuentra el ajuste perfecto. Nuestras prendas están diseñadas con un estilo moderno y un corte ligeramente holgado para garantizar la máxima comodidad y estilo.
                    </p>
                </div>
            </div>

            {/* Contenido Principal */}
            <div className="container mx-auto px-4 py-16">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 lg:gap-24 items-center max-w-6xl mx-auto">

                    {/* Sección Izquierda: Ilustración/Instrucciones */}
                    <div className="space-y-8">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-gray-100 relative overflow-hidden group">
                            <div className="absolute top-0 right-0 w-32 h-32 bg-accent/5 rounded-full blur-3xl -z-0"></div>

                            <h2 className="text-2xl font-bold text-gray-900 mb-6 relative z-10">¿Cómo medirte?</h2>

                            <div className="space-y-6 relative z-10">
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">1</div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">Ancho de Pecho</h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            Mide de extremo a extremo justo por debajo de las mangas de una camiseta que te quede bien, colocada sobre una superficie plana.
                                        </p>
                                    </div>
                                </div>
                                <div className="flex gap-4">
                                    <div className="w-8 h-8 rounded-full bg-primary text-white flex items-center justify-center font-bold shrink-0">2</div>
                                    <div>
                                        <h3 className="font-semibold text-gray-900 text-lg">Largo Total</h3>
                                        <p className="text-gray-600 text-sm mt-1">
                                            Mide desde el punto más alto del hombro (junto al cuello) hasta el borde inferior de la camiseta.
                                        </p>
                                    </div>
                                </div>
                            </div>

                            {/* Ilustración de Camiseta Simplificada (Usamos SVG en lugar de imagen para ser independientes) */}
                            <div className="mt-10 flex justify-center opacity-80 group-hover:opacity-100 transition-opacity">
                                <svg width="200" height="200" viewBox="0 0 200 200" fill="none" xmlns="http://www.w3.org/2000/svg">
                                    {/* Cuerpo Camiseta */}
                                    <path d="M50 70 L20 100 L40 120 L60 90 L60 180 L140 180 L140 90 L160 120 L180 100 L150 70 C140 50 120 40 100 40 C80 40 60 50 50 70 Z" fill="#F3F4F6" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                    {/* Cuello */}
                                    <path d="M80 40 C80 55 120 55 120 40" stroke="#1F2937" strokeWidth="4" strokeLinecap="round" />

                                    {/* Línea Pecho (Horizontal) */}
                                    <line x1="45" y1="110" x2="155" y2="110" stroke="#EAB308" strokeWidth="2" strokeDasharray="6 6" />
                                    <circle cx="45" cy="110" r="4" fill="#EAB308" />
                                    <circle cx="155" cy="110" r="4" fill="#EAB308" />
                                    <text x="100" y="105" textAnchor="middle" fill="#EAB308" fontSize="12" fontWeight="bold">1</text>

                                    {/* Línea Largo (Vertical) */}
                                    <line x1="85" y1="45" x2="85" y2="180" stroke="#3B82F6" strokeWidth="2" strokeDasharray="6 6" />
                                    <circle cx="85" cy="45" r="4" fill="#3B82F6" />
                                    <circle cx="85" cy="180" r="4" fill="#3B82F6" />
                                    <text x="75" y="115" textAnchor="middle" fill="#3B82F6" fontSize="12" fontWeight="bold">2</text>
                                </svg>
                            </div>
                        </div>
                    </div>

                    {/* Sección Derecha: Tabla de Tallas */}
                    <div>
                        <div className="bg-white rounded-2xl shadow-xl border border-gray-100 overflow-hidden">
                            <div className="bg-primary px-6 py-4">
                                <h2 className="text-xl font-bold text-white tracking-wide">Medidas por Talla (cm)</h2>
                            </div>

                            <div className="overflow-x-auto">
                                <table className="w-full text-left border-collapse">
                                    <thead>
                                        <tr className="bg-gray-50 border-b border-gray-100 text-gray-500 uppercase text-xs font-semibold tracking-wider">
                                            <th className="px-6 py-4">Talla</th>
                                            <th className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-yellow-500 inline-block"></span>
                                                    Ancho (Pecho)
                                                </div>
                                            </th>
                                            <th className="px-6 py-4">
                                                <div className="flex items-center gap-2">
                                                    <span className="w-3 h-3 rounded-full bg-blue-500 inline-block"></span>
                                                    Largo Total
                                                </div>
                                            </th>
                                        </tr>
                                    </thead>
                                    <tbody className="divide-y divide-gray-100">
                                        {[
                                            { size: 'XS', width: '48', length: '68' },
                                            { size: 'S', width: '50', length: '70' },
                                            { size: 'M', width: '53', length: '72' },
                                            { size: 'L', width: '56', length: '74' },
                                            { size: 'XL', width: '59', length: '76' },
                                            { size: 'U (Única)', width: '55', length: '73' },
                                        ].map((row, index) => (
                                            <tr key={index} className="hover:bg-gray-50 transition-colors group">
                                                <td className="px-6 py-5 whitespace-nowrap">
                                                    <div className="inline-flex items-center justify-center w-10 h-10 rounded-lg bg-gray-100 text-primary font-bold group-hover:bg-accent group-hover:text-white transition-colors">
                                                        {row.size}
                                                    </div>
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-gray-700 font-medium">
                                                    {row.width} cm
                                                </td>
                                                <td className="px-6 py-5 whitespace-nowrap text-gray-700 font-medium">
                                                    {row.length} cm
                                                </td>
                                            </tr>
                                        ))}
                                    </tbody>
                                </table>
                            </div>

                            <div className="bg-gray-50 px-6 py-4 border-t border-gray-100 text-xs text-gray-500">
                                * Las medidas son aproximadas y pueden variar +/- 1 cm. Recomendamos comparar estas medidas con una prenda que ya tengas.
                            </div>
                        </div>
                    </div>

                </div>
            </div>
        </div>
    );
}
