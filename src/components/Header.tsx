"use client"; // Directiva para indicar que es un Componente de Cliente

import { useState } from 'react';
import Link from 'next/link';

 const Header = () => {
  // Estado para controlar la visibilidad del menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);

   return (
    <header className="bg-white shadow-md relative">
      <nav className="container mx-auto px-6 py-4 flex justify-between items-center">
        {/* Logo o Nombre de la Tienda */}
        <Link href="/" className="text-2xl font-bold text-gray-800 hover:text-gray-700">
          two-six-web
        </Link>

        {/* Menú para Escritorio (Desktop) */}
        <ul className="hidden md:flex items-center space-x-6">
          <li>
            <Link href="/man" className="text-gray-600 hover:text-blue-500 font-semibold">
              Hombre
            </Link>
          </li>
          <li>
            <Link href="/woman" className="text-gray-600 hover:text-pink-500 font-semibold">
              Mujer
            </Link>
          </li>
        </ul>

        {/* Botón de Hamburguesa para Móvil */}
        <div className="md:hidden">
          <button onClick={() => setIsMenuOpen(!isMenuOpen)} aria-label="Abrir menú">
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 6h16M4 12h16m-7 6h7"></path>
            </svg>
          </button>
        </div>
      </nav>

      {/* Menú Desplegable para Móvil */}
      {isMenuOpen && (
        <div className="md:hidden bg-white absolute w-full shadow-lg">
          <ul className="flex flex-col items-center space-y-4 py-4">
            <li>
              <Link href="/man" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-blue-500 font-semibold">
                Hombre
              </Link>
            </li>
            <li>
              <Link href="/woman" onClick={() => setIsMenuOpen(false)} className="text-gray-600 hover:text-pink-500 font-semibold">
                Mujer
              </Link>
            </li>
          </ul>
        </div>
      )}
    </header>
  );
 };

 export default Header;
