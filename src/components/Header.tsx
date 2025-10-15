"use client"; // Directiva para indicar que es un Componente de Cliente

import { useState, useEffect } from 'react';
import Link from 'next/link';

 const Header = () => {
  // Estado para controlar la visibilidad del menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);

  // Efecto para cerrar el menú si la pantalla se agranda
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

   return (
    <header className="bg-white shadow-sm sticky top-0 z-50">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo o Nombre de la Tienda */}
        <Link href="/" className="text-2xl font-bold text-primary hover:text-accent">
          two-six-web
        </Link>

        {/* Menú para Escritorio (Desktop) */}
        <ul className="hidden md:flex items-center space-x-6">
          <li>
            <Link href="/man" className="text-primary hover:text-accent font-semibold transition-colors duration-300">
              Hombre
            </Link>
          </li>
          <li>
            <Link href="/woman" className="text-primary hover:text-accent font-semibold transition-colors duration-300">
              Mujer
            </Link>
          </li>
        </ul>

        {/* Botón de Hamburguesa para Móvil */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menú" className="text-primary">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              {isMenuOpen ? (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
              ) : (
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7" />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Menú Desplegable para Móvil */}
      <div
        className={`md:hidden bg-white absolute w-full shadow-lg transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col items-center space-y-6 py-6">
          <li>
            <Link href="/man" onClick={() => setIsMenuOpen(false)} className="text-lg text-primary hover:text-accent font-semibold">
              Hombre
            </Link>
          </li>
          <li>
            <Link href="/woman" onClick={() => setIsMenuOpen(false)} className="text-lg text-primary hover:text-accent font-semibold">
              Mujer
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
 };

 export default Header;
