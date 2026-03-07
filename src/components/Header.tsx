"use client"; // Directiva para indicar que es un Componente de Cliente

import { useState, useEffect } from "react";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useAuth } from "@/context/AuthContext";
import { ChevronDown } from "lucide-react";
import Image from "next/image";
import * as React from "react";
import { cn } from "@/lib/utils";
import {
  NavigationMenu,
  NavigationMenuContent,
  NavigationMenuItem,
  NavigationMenuLink,
  NavigationMenuList,
  NavigationMenuTrigger,
  navigationMenuTriggerStyle,
} from "@/components/ui/navigation-menu";

const ListItem = React.forwardRef<
  React.ElementRef<"a">,
  React.ComponentPropsWithoutRef<"a">
>(({ className, title, children, href, ...props }, ref) => {
  return (
    <li>
      <NavigationMenuLink asChild>
        <Link
          ref={ref}
          href={href || "#"}
          className={cn(
            "block select-none space-y-1 rounded-md p-3 leading-none no-underline outline-none transition-colors hover:bg-accent/10 hover:text-accent focus:bg-accent/10 focus:text-accent",
            className
          )}
          {...props}
        >
          <div className="text-sm font-medium leading-none mb-2">{title}</div>
          <p className="line-clamp-2 text-sm leading-snug text-muted-foreground">
            {children}
          </p>
        </Link>
      </NavigationMenuLink>
    </li>
  )
})
ListItem.displayName = "ListItem";

// 1. Definir la interfaz para las props del componente
interface HeaderProps {
  showOutletLink: boolean;
}

const Header = ({ showOutletLink }: HeaderProps) => {
  // Estado para controlar la visibilidad del menú móvil
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { isLoggedIn, userName, logout } = useAuth();
  const { itemCount } = useCart();
  const [expandedMobileMenu, setExpandedMobileMenu] = useState<string | null>(null);

  const toggleMobileSubmenu = (menu: string) => {
    if (expandedMobileMenu === menu) {
      setExpandedMobileMenu(null);
    } else {
      setExpandedMobileMenu(menu);
    }
  };

  // Efecto para cerrar el menú si la pantalla se agranda
  useEffect(() => {
    const handleResize = () => {
      if (window.innerWidth >= 768) {
        setIsMenuOpen(false);
      }
    };
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

  return (
    <header className="bg-white/85 backdrop-blur-md sticky top-0 z-50 shadow-sm border-b border-gray-100/50">
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

        {/* Menú para Escritorio (Desktop) con Shadcn Navigation-Menu */}
        <div className="hidden lg:flex flex-1 justify-center">
          <NavigationMenu>
            <NavigationMenuList>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium uppercase tracking-wider text-primary bg-transparent hover:bg-transparent hover:text-accent">Hombre</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 text-center no-underline outline-none focus:shadow-md"
                          href="/man"
                        >
                          <div className="mb-2 mt-4 text-lg font-serif">Colección Hombre</div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Descubre las últimas tendencias y clásicos atemporales para el guardarropa masculino.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem href="/man?category=Camiseta" title="Camisetas">
                      Estilos formales y casuales.
                    </ListItem>
                    <ListItem href="/man?category=Pantalon%20Largo" title="Pantalones Largos">
                      Jeans, chinos y de vestir.
                    </ListItem>
                    <ListItem href="/man?category=Accesorios" title="Accesorios">
                      Complementos perfectos.
                    </ListItem>
                    <li className="md:col-span-2 mt-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/man"
                          className="block w-full rounded-md bg-accent/10 px-4 py-3 text-center text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white"
                        >
                          Ver Todo
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuTrigger className="text-sm font-medium uppercase tracking-wider text-primary bg-transparent hover:bg-transparent hover:text-accent">Mujer</NavigationMenuTrigger>
                <NavigationMenuContent>
                  <ul className="grid gap-3 p-4 md:w-[400px] lg:w-[500px] lg:grid-cols-[.75fr_1fr]">
                    <li className="row-span-3">
                      <NavigationMenuLink asChild>
                        <Link
                          className="flex h-full w-full select-none flex-col justify-center rounded-md bg-gradient-to-b from-muted/50 to-muted p-6 no-underline outline-none focus:shadow-md"
                          href="/woman"
                        >
                          <div className="mb-2 mt-4 text-lg font-serif">Colección Mujer</div>
                          <p className="text-sm leading-tight text-muted-foreground">
                            Elegancia, comodidad y versatilidad para cualquier ocasión de tu vida.
                          </p>
                        </Link>
                      </NavigationMenuLink>
                    </li>
                    <ListItem title="Vestidos" href="/woman?category=Vestido">
                      Elegancia natural para cada ocasión.
                    </ListItem>
                    <ListItem title="Camisetas" href="/woman?category=Camiseta">
                      Comodidad y estilo diario.
                    </ListItem>
                    <ListItem title="Faldas" href="/woman?category=Falda">
                      Diseños exclusivos y dinámicos.
                    </ListItem>
                    <li className="md:col-span-2 mt-2">
                      <NavigationMenuLink asChild>
                        <Link
                          href="/woman"
                          className="block w-full rounded-md bg-accent/10 px-4 py-3 text-center text-sm font-medium text-accent transition-colors hover:bg-accent hover:text-white"
                        >
                          Ver Todo
                        </Link>
                      </NavigationMenuLink>
                    </li>
                  </ul>
                </NavigationMenuContent>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-transparent text-sm font-medium uppercase tracking-wider text-primary hover:text-accent")}>
                  <Link href="/unisex">
                    Unisex
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

              <NavigationMenuItem>
                <NavigationMenuLink asChild className={cn(navigationMenuTriggerStyle(), "bg-transparent hover:bg-transparent text-sm font-medium uppercase tracking-wider text-primary hover:text-accent")}>
                  <Link href="/tracking">
                    Rastrear Pedido
                  </Link>
                </NavigationMenuLink>
              </NavigationMenuItem>

            </NavigationMenuList>
          </NavigationMenu>
        </div>

        {/* Iconos de Acción */}
        <div className="hidden lg:flex flex-1 justify-end items-center space-x-4">
          <button
            aria-label="Buscar"
            className="text-primary hover:text-accent transition-colors p-2"
          >
            <svg
              className="w-6 h-6"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z"
              ></path>
            </svg>
          </button>
          <div className="h-6 border-l border-gray-300"></div>

          {/* Profile Section */}
          {isLoggedIn ? (
            <div className="relative group flex items-center gap-2">
              <span className="text-sm font-medium text-gray-700 hidden lg:block">
                Hola, {userName ? userName.split(' ')[0] : 'Usuario'}
              </span>
              <button
                aria-label="Menú de usuario"
                className="text-accent hover:text-primary transition-colors p-2 focus:outline-none"
              >
                <svg
                  className="w-6 h-6"
                  fill="currentColor"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth="2"
                    d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                  ></path>
                </svg>
              </button>
              {/* Dropdown Menu */}
              <div className="absolute right-0 top-full mt-2 w-48 bg-white rounded-md shadow-lg py-1 z-50 opacity-0 invisible group-hover:opacity-100 group-hover:visible transition-all duration-300 transform origin-top-right">
                <div className="px-4 py-2 border-b border-gray-100 lg:hidden">
                  <p className="text-sm font-medium text-gray-900">{userName}</p>
                </div>
                <Link
                  href="/profile"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mi Perfil
                </Link>
                <Link
                  href="/orders"
                  className="block px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                >
                  Mis Pedidos
                </Link>
                <button
                  onClick={logout}
                  className="block w-full text-left px-4 py-2 text-sm text-red-600 hover:bg-gray-100"
                >
                  Cerrar Sesión
                </button>
              </div>
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Iniciar Sesión"
              className="text-primary hover:text-accent transition-colors p-2"
            >
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </Link>
          )}
          <div className="h-6 border-l border-gray-300"></div>
          <button
            aria-label={`Carrito de compras con ${itemCount} artículos`}
            className="relative text-primary hover:text-accent transition-colors p-2"
          >
            <Link href="/cart">
              <svg
                className="w-6 h-6"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
                ></path>
              </svg>
              {itemCount > 0 && (
                <span className="absolute top-0 right-0 block h-5 w-5 rounded-full bg-accent text-white text-xs flex items-center justify-center">
                  {itemCount}
                </span>
              )}
            </Link>
          </button>
        </div>

        {/* Acciones para Móvil */}
        <div className="lg:hidden flex-1 flex justify-end items-center space-x-3">
          {/* Mobile Profile/Login Icon */}
          {isLoggedIn ? (
            <div className="relative group flex items-center">
              <button
                aria-label="Menú de usuario"
                onClick={() => setIsMenuOpen(false)} // optional, simply a link to profile can be added directly or tap to open a modal. Doing a simple link for mobile for ease.
                className="text-primary hover:text-accent transition-colors p-1.5 focus:outline-none"
              >
                <Link href="/profile">
                  <svg
                    className="w-[22px] h-[22px]"
                    fill="currentColor"
                    stroke="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      strokeWidth="2"
                      d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                    ></path>
                  </svg>
                </Link>
              </button>
            </div>
          ) : (
            <Link
              href="/login"
              aria-label="Iniciar Sesión"
              className="text-primary hover:text-accent transition-colors p-1.5"
            >
              <svg
                className="w-[22px] h-[22px]"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"
                ></path>
              </svg>
            </Link>
          )}

          <Link
            href="/cart"
            aria-label={`Carrito de compras con ${itemCount} artículos`}
            className="relative text-primary p-1.5 hover:text-accent transition-colors"
          >
            <svg
              className="w-[22px] h-[22px]"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth="2"
                d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"
              ></path>
            </svg>
            {itemCount > 0 && (
              <span className="absolute -top-1 -right-1 block h-4 w-4 rounded-full bg-accent text-white text-[10px] flex items-center justify-center font-bold">
                {itemCount}
              </span>
            )}
          </Link>

          <button
            onClick={() => setIsMenuOpen(!isMenuOpen)}
            aria-label="Abrir menú"
            className="text-primary focus:outline-none p-2 rounded-full border border-gray-200/60 shadow-sm bg-white hover:bg-gray-50 hover:border-accent transition-all duration-300 ml-1"
          >
            <svg
              className="w-5 h-5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              {isMenuOpen ? (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M6 18L18 6M6 6l12 12"
                />
              ) : (
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2.5"
                  d="M4 6h16M4 12h16m-7 6h7"
                />
              )}
            </svg>
          </button>
        </div>
      </nav>

      {/* Menú Desplegable para Móvil */}
      <div
        className={`lg:hidden bg-white/95 backdrop-blur-md absolute w-full shadow-xl transition-all duration-300 ease-in-out overflow-hidden ${isMenuOpen ? "max-h-screen opacity-100" : "max-h-0 opacity-0"
          }`}
      >
        <ul className="flex flex-col items-center w-full px-6 py-4">
          <li className="w-full">
            <div className="flex flex-col items-center w-full">
              <button
                onClick={() => toggleMobileSubmenu('man')}
                className="flex items-center justify-center gap-2 w-full py-5 text-lg font-medium uppercase tracking-wider text-primary hover:text-accent"
              >
                <span>Hombre</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedMobileMenu === 'man' ? 'rotate-180 text-accent' : ''}`} />
              </button>

              <div className={`flex flex-col items-center overflow-hidden transition-all duration-300 w-full ${expandedMobileMenu === 'man' ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                <Link
                  href="/man?category=Camiseta"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 text-base text-gray-500 hover:text-accent w-full text-center"
                >
                  Camisetas
                </Link>
                <Link
                  href="/man?category=Pantalon%20Largo"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 text-base text-gray-500 hover:text-accent w-full text-center"
                >
                  Pantalones Largos
                </Link>
                <Link
                  href="/man?category=Accesorios"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 text-base text-gray-500 hover:text-accent w-full text-center"
                >
                  Accesorios
                </Link>
                <Link
                  href="/man"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 mt-2 text-base font-medium text-accent hover:text-primary w-full text-center"
                >
                  Ver Todo Hombre
                </Link>
              </div>
            </div>
          </li>

          <div className="w-full h-[1px] bg-gray-200"></div>

          <li className="w-full">
            <div className="flex flex-col items-center w-full">
              <button
                onClick={() => toggleMobileSubmenu('woman')}
                className="flex items-center justify-center gap-2 w-full py-5 text-lg font-medium uppercase tracking-wider text-primary hover:text-accent"
              >
                <span>Mujer</span>
                <ChevronDown className={`w-5 h-5 transition-transform duration-300 ${expandedMobileMenu === 'woman' ? 'rotate-180 text-accent' : ''}`} />
              </button>

              <div className={`flex flex-col items-center overflow-hidden transition-all duration-300 w-full ${expandedMobileMenu === 'woman' ? 'max-h-96 opacity-100 pb-5' : 'max-h-0 opacity-0'}`}>
                <Link
                  href="/woman?category=Top"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 text-base text-gray-500 hover:text-accent w-full text-center"
                >
                  Tops
                </Link>
                <Link
                  href="/woman?category=Vestido"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 text-base text-gray-500 hover:text-accent w-full text-center"
                >
                  Vestidos
                </Link>
                <Link
                  href="/woman?category=Camiseta"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 text-base text-gray-500 hover:text-accent w-full text-center"
                >
                  Camisetas
                </Link>
                <Link
                  href="/woman?category=Falda"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 text-base text-gray-500 hover:text-accent w-full text-center"
                >
                  Faldas
                </Link>
                <Link
                  href="/woman"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-2.5 mt-2 text-base font-medium text-accent hover:text-primary w-full text-center"
                >
                  Ver Toda Mujer
                </Link>
              </div>
            </div>
          </li>

          <div className="w-full h-[1px] bg-gray-200"></div>

          <li className="w-full">
            <Link
              href="/unisex"
              onClick={() => setIsMenuOpen(false)}
              className="py-5 text-lg font-medium uppercase tracking-wider text-primary hover:text-accent block text-center w-full"
            >
              Unisex
            </Link>
          </li>

          <div className="w-full h-[1px] bg-gray-200"></div>

          <li className="w-full">
            <Link
              href="/tracking"
              onClick={() => setIsMenuOpen(false)}
              className="py-5 text-lg font-medium uppercase tracking-wider text-primary hover:text-accent block text-center w-full"
            >
              Rastrear Pedido
            </Link>
          </li>

          {showOutletLink && (
            <>
              <div className="w-full h-[1px] bg-gray-200"></div>
              <li className="w-full">
                <Link
                  href="/outlet"
                  onClick={() => setIsMenuOpen(false)}
                  className="py-5 text-lg font-bold uppercase tracking-wider text-red-500 hover:text-red-600 block text-center w-full"
                >
                  Outlet
                </Link>
              </li>
            </>
          )}
        </ul>
      </div>
    </header>
  );
};

export default Header;
