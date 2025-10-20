// src/layout.tsx
import type { Metadata } from "next";
import { Inter } from "next/font/google";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";
import Header from "@/components/Header";
import { prisma } from "@/lib/db";
import Footer from "@/components/Footer";

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
  const outletProductCount = await prisma.product.count({
    where: {
      category: "OUTLET",
    },
  });
  const showOutletLink = outletProductCount > 0;

  return (
    <html lang="es">
      <body className={`${inter.className} flex flex-col min-h-screen`}>
        <Header showOutletLink={showOutletLink} />
        <main className="flex-grow">{children}</main>
        <WhatsAppButton />
        <Footer showOutletLink={showOutletLink} />
      </body>
    </html>
  );
}
