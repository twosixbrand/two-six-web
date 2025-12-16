// src/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProducts } from "@/data/products";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "two-six-web | Tu Tienda de Ropa",
  description: "Las mejores prendas para hombre y mujer.",
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // Obtenemos los productos de outlet y contamos su longitud
  // Consultamos si existen productos de outlet para mostrar el enlace en el menú
  const outletProducts = await getProducts({ isOutlet: true });
  const outletProductCount = outletProducts.length;
  const showOutletLink = outletProductCount > 0;

  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <CartProvider>
          <AuthProvider>
            <Header showOutletLink={showOutletLink} />
            <main className="flex-grow">{children}</main>
            <WhatsAppButton />
            <Footer showOutletLink={showOutletLink} />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}
