import type { Metadata } from 'next';
import { getProductsBySlug, getProductById } from "@/data/products";
import ProductDetail from "@/components/ProductDetail";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound, permanentRedirect } from "next/navigation";
import { getSeoOverrides } from '@/utils/seoDictionary';

export const dynamic = 'force-dynamic';

// Esta función genera metadatos dinámicos para el <head> de la página
export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;

  if (!slug) {
    return { title: "Página no encontrada" };
  }

  let result = await getProductsBySlug(slug);
  
  let fallbackProduct = null;
  // Fallback SEO: Si no existe el slug y es un número, significa que es una vieja URL
  if ((!result || result.products.length === 0) && /^\d+$/.test(slug)) {
    fallbackProduct = await getProductById(Number(slug));
  }

  if ((!result || result.products.length === 0) && !fallbackProduct) {
    return { title: "Producto no encontrado" };
  }

  // Encontramos el producto representativo del color seleccionado
  const product = fallbackProduct || (result.products.find(p => p.clothingSize?.clothingColor?.color?.id === result.colorId) || result.products[0]);

  const color = product.clothingSize?.clothingColor?.color?.name || "";
  const gender = product.gender || 'Unisex';
  const reference = product.clothingSize?.clothingColor?.design?.reference || "";
  
  const seoOverride = getSeoOverrides(reference, color, gender);

  const imageUrl = product.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url || product.image_url;
  
  const title = seoOverride?.title || product.name || "Two Six";
  const description = seoOverride?.description || product.description || `Compra ${product.name} en Two Six. Ropa colombiana con estilo y confort. Envíos a toda Colombia.`;

  return {
    title: title,
    description: description,
    alternates: { canonical: `/product/${slug}` },
    openGraph: {
      title: `${title} | Two Six`,
      description: description,
      url: `/product/${slug}`,
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
  params: Promise<{ slug: string }>;
}) {
  const params = await props.params;
  const slug = params.slug;
  if (!slug) {
    return notFound();
  }

  const result = await getProductsBySlug(slug);
  if (!result || result.products.length === 0) {
    if (/^\d+$/.test(slug)) {
      const fallbackProduct = await getProductById(Number(slug));
      if (fallbackProduct?.clothingSize?.clothingColor?.slug) {
         // Redirigimos permanentemente para que Google aprenda la nueva URL
         permanentRedirect(`/product/${fallbackProduct.clothingSize.clothingColor.slug}`);
      }
    }
    notFound();
  }

  const { products: variants, colorId } = result;
  const product = variants.find(p => p.clothingSize?.clothingColor?.color?.id === colorId) || variants[0];

  const genderMap: { [key: string]: string } = {
    'femenino': 'woman',
    'masculino': 'man',
    'unisex': 'unisex',
  };

  const gender = product.gender || 'Unisex';
  const genderSlug = genderMap[gender.toLowerCase()] || gender.toLowerCase();

  const reference = product.clothingSize?.clothingColor?.design?.reference || "";
  const colorName = product.clothingSize?.clothingColor?.color?.name || "";
  const seoOverride = getSeoOverrides(reference, colorName, gender);

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: gender, href: `/${genderSlug}` },
    { label: seoOverride?.h1 || product.name || "Diseño", href: `/${genderSlug}` },
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
      url: `https://twosixweb.com/product/${slug}`,
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

