// src/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// 1. Importa tu nuevo componente Header
import Header from "@/components/Header";
import Footer from '@/components/Footer';

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "two-six-web | Tu Tienda de Ropa",
  description: "Las mejores prendas para hombre y mujer.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <div className="flex-grow">
          {/* 2. Añade el Header aquí, antes de {children} */}
          <Header />
          
          {/* {children} es donde se renderizará el contenido de cada página */}
          <main className="container mx-auto p-6">
            {children}
          </main>
        </div>
        <Footer />
      </body>
    </html>
  );
}
