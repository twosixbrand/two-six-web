// src/layout.tsx
import type { Metadata } from "next";
import { Inter, Playfair_Display } from "next/font/google";
import WhatsAppButton from "@/components/WhatsAppButton";
import "./globals.css";
import { CartProvider } from "@/context/CartContext";
import { AuthProvider } from "@/context/AuthContext";
import Header from "@/components/Header";
import Footer from "@/components/Footer";
import { getProducts } from "@/data/products";
import CookieConsent from "@/components/CookieConsent";

const inter = Inter({ subsets: ["latin"], variable: '--font-inter' });
const playfair = Playfair_Display({ subsets: ["latin"], variable: '--font-playfair' });

export const metadata: Metadata = {
  metadataBase: new URL('https://twosixweb.com'),
  title: {
    default: 'Two Six | Ropa Colombiana con Estilo y Confort',
    template: '%s | Two Six',
  },
  description: 'Descubre Two Six: ropa colombiana para hombre y mujer con actitud urbana. Camisetas, hoodies y más. Envíos a toda Colombia. Crafted for real ones.',
  keywords: ['ropa colombiana', 'streetwear', 'camisetas', 'hoodies', 'ropa hombre', 'ropa mujer', 'Two Six', 'moda urbana', 'tienda online Colombia'],
  authors: [{ name: 'Two Six Brand' }],
  creator: 'Two Six Brand',
  publisher: 'Two Six Brand',
  verification: {
    google: '85VmCrMCj1nHCVp_Dcz75C0Gug_eZzRbskS3U5CX_BA',
  },
  openGraph: {
    type: 'website',
    locale: 'es_CO',
    url: 'https://twosixweb.com',
    siteName: 'Two Six',
    title: 'Two Six | Ropa Colombiana con Estilo y Confort',
    description: 'Más que ropa, una actitud. Descubre la colección de ropa urbana Two Six. Envíos a toda Colombia.',
    images: [
      {
        url: '/og-image.jpg',
        width: 1200,
        height: 630,
        alt: 'Two Six - Más que ropa, una actitud',
      },
    ],
  },
  twitter: {
    card: 'summary_large_image',
    title: 'Two Six | Ropa Colombiana con Estilo y Confort',
    description: 'Más que ropa, una actitud. Descubre la colección de ropa urbana Two Six.',
    images: ['/og-image.jpg'],
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-video-preview': -1,
      'max-image-preview': 'large',
      'max-snippet': -1,
    },
  },
  alternates: {
    canonical: 'https://twosixweb.com',
  },
};

// JSON-LD Organization structured data
const organizationJsonLd = {
  '@context': 'https://schema.org',
  '@type': 'Organization',
  name: 'Two Six',
  url: 'https://twosixweb.com',
  logo: 'https://twosixweb.com/logo-gorilla.png',
  description: 'Marca de ropa colombiana con actitud urbana. Camisetas, hoodies y más para hombre y mujer.',
  sameAs: [
    'https://www.instagram.com/twosix.brand',
    'https://www.tiktok.com/@twosix_brand',
    'https://www.facebook.com/TwoSix',
  ],
  contactPoint: {
    '@type': 'ContactPoint',
    contactType: 'customer service',
    email: 'twosixmarca@gmail.com',
    availableLanguage: 'Spanish',
  },
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
      <head>
        <script
          type="application/ld+json"
          dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }}
        />
      </head>
      <body className={`${inter.variable} ${playfair.variable} font-sans flex flex-col min-h-screen`}>
        <CartProvider>
          <AuthProvider>
            <Header showOutletLink={showOutletLink} />
            <main className="flex-grow">{children}</main>
            <WhatsAppButton />
            <Footer showOutletLink={showOutletLink} />
            <CookieConsent />
          </AuthProvider>
        </CartProvider>
      </body>
    </html>
  );
}

