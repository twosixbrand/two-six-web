import type { Metadata } from 'next';
import { getProductById, getProductsByDesignReference } from "@/data/products";
import ProductDetail from "@/components/ProductDetail";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound } from "next/navigation";
import { getSeoOverrides } from '@/utils/seoDictionary';

export const dynamic = 'force-dynamic';

// Esta función genera metadatos dinámicos para el <head> de la página
export async function generateMetadata({ params }: { params: Promise<{ id: string }> }): Promise<Metadata> {
  const { id: idString } = await params;
  const id = Number(idString);

  if (isNaN(id)) {
    return { title: "Página no encontrada" };
  }

  const product = await getProductById(id);
  if (!product) {
    return { title: "Producto no encontrado" };
  }

  const color = product.clothingSize?.clothingColor?.color?.name || "";
  const gender = product.gender || 'Unisex';
  const reference = product.clothingSize?.clothingColor?.design?.reference || "";
  
  const seoOverride = getSeoOverrides(reference, color, gender);

  const imageUrl = product.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url || product.image_url;
  
  const title = seoOverride?.title || product.name;
  const description = seoOverride?.description || product.description || `Compra ${product.name} en Two Six. Ropa colombiana con estilo y confort. Envíos a toda Colombia.`;

  return {
    title: title,
    description: description,
    alternates: { canonical: `/product/${id}` },
    openGraph: {
      title: `${title} | Two Six`,
      description: description,
      url: `/product/${id}`,
      type: 'website',
      images: imageUrl ? [
        {
          url: imageUrl,
          width: 800,
          height: 800,
          alt: seoOverride?.alt || product.name,
        },
      ] : undefined,
    },
    twitter: {
      card: 'summary_large_image',
      title: `${title} | Two Six`,
      description: description,
      images: imageUrl ? [imageUrl] : undefined,
    },
  };
}

// Este es el componente de página (Server Component).
export default async function ProductDetailPage(props: {
  params: Promise<{ id: string }>;
}) {
  const params = await props.params;
  const id = Number(params.id);
  if (isNaN(id)) {
    return notFound();
  }

  const product = await getProductById(id);
  if (!product) {
    notFound();
  }

  const variants = await getProductsByDesignReference(product.clothingSize.clothingColor.design.reference);

  const genderMap: { [key: string]: string } = {
    'femenino': 'woman',
    'masculino': 'man',
    'unisex': 'unisex',
  };

  const gender = product.gender || 'Unisex';
  const genderSlug = genderMap[gender.toLowerCase()] || gender.toLowerCase();

  const reference = product.clothingSize?.clothingColor?.design?.reference || "";
  const color = product.clothingSize?.clothingColor?.color?.name || "";
  const seoOverride = getSeoOverrides(reference, color, gender);

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: gender, href: `/${genderSlug}` },
    { label: seoOverride?.h1 || product.name, href: `/${genderSlug}` },
  ];

  const imageUrl = product.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url || product.image_url;

  // JSON-LD Product structured data for Google rich snippets
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: seoOverride?.h1 || product.name,
    description: seoOverride?.description || product.description,
    image: imageUrl,
    audience: seoOverride?.audience ? {
      "@type": "Audience",
      "audienceType": seoOverride.audience
    } : undefined,
    brand: {
      '@type': 'Brand',
      name: 'Two Six',
    },
    offers: {
      '@type': 'Offer',
      url: `https://twosixweb.com/product/${id}`,
      priceCurrency: 'COP',
      price: product.price,
      availability: product.clothingSize?.quantity_available > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Two Six',
      },
    },
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <div className="py-6">
        <Breadcrumbs items={breadcrumbItems} />
      </div>
      <ProductDetail 
        initialProduct={product} 
        variants={variants} 
        seoOverride={seoOverride} 
      />
    </div>
  );
}

