"use client"; // Directiva para indicar que es un Componente de Cliente

import { useState, useEffect } from 'react';
import Link from 'next/link';
import Image from 'next/image';

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
    <header className="bg-white sticky top-0 z-50 shadow-md">
      <nav className="container mx-auto px-4 flex justify-between items-center">
        {/* Logo o Nombre de la Tienda */}
        <div className="flex-1">
          <Link href="/">
            <Image
              src="/logo.png" // Next.js busca esto en la carpeta /public
              alt="two-six-web Logo"
              width={180} 
              height={60} 
              className="h-auto w-auto"
            />
          </Link>
        </div>

        {/* Menú para Escritorio (Desktop) */}
        <ul className="hidden md:flex items-center space-x-10">
          <li>
            <Link href="/man" className="text-sm font-medium uppercase tracking-wider text-primary transition-colors duration-300 relative group">
              Hombre
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
            </Link>
          </li>
          <li>
            <Link href="/woman" className="text-sm font-medium uppercase tracking-wider text-primary transition-colors duration-300 relative group">
              Mujer
              <span className="absolute -bottom-2 left-0 w-full h-0.5 bg-accent scale-x-0 group-hover:scale-x-100 transition-transform duration-300 ease-out"></span>
            </Link>
          </li>
        </ul>

        {/* Iconos de Acción */}
        <div className="hidden md:flex flex-1 justify-end items-center space-x-4">
          <button aria-label="Buscar" className="text-primary hover:text-accent transition-colors p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"></path></svg></button>
          <div className="h-6 border-l border-gray-300"></div>
          <button aria-label="Cuenta de usuario" className="text-primary hover:text-accent transition-colors p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"></path></svg></button>
          <div className="h-6 border-l border-gray-300"></div>
          <button aria-label="Carrito de compras" className="text-primary hover:text-accent transition-colors p-2"><svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"></path></svg></button>
        </div>

        {/* Botón de Hamburguesa para Móvil */}
        <div className="md:hidden flex-1 flex justify-end">
          <button 
            onClick={() => setIsMenuOpen(!isMenuOpen)} 
            aria-label="Abrir menú" 
            className="text-primary focus:outline-none"
          >
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
        className={`md:hidden bg-white absolute w-full shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${
          isMenuOpen ? 'max-h-screen opacity-100' : 'max-h-0 opacity-0'
        }`}
      >
        <ul className="flex flex-col items-center space-y-6 py-6">
          <li>
            <Link href="/man" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium uppercase tracking-wider text-primary hover:text-accent">
              Hombre
            </Link>
          </li>
          <li>
            <Link href="/woman" onClick={() => setIsMenuOpen(false)} className="text-lg font-medium uppercase tracking-wider text-primary hover:text-accent">
              Mujer
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
 };

 export default Header;
