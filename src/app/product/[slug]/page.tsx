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

  const clothingColor = product.clothingSize?.clothingColor;
  const color = clothingColor?.color?.name || "";
  const gender = product.gender || 'Unisex';
  const reference = clothingColor?.design?.reference || "";
  
  // Cadena de prioridad: DB → diccionario → genérico
  const seoOverride = getSeoOverrides(reference, color, gender);
  const dbSeo = {
    title: clothingColor?.seo_title || null,
    description: clothingColor?.seo_desc || null,
    h1: clothingColor?.seo_h1 || null,
    alt: clothingColor?.seo_alt || null,
  };

  const imageUrl = clothingColor?.imageClothing?.[0]?.image_url || product.image_url;
  
  const title = dbSeo.title || seoOverride?.title || product.name || "Two Six";
  const description = dbSeo.description || seoOverride?.description || product.description || `Compra ${product.name} en Two Six. Ropa colombiana con estilo y confort. Envíos a toda Colombia.`;

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
          alt: dbSeo.alt || seoOverride?.alt || product.name,
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

  const clothingColor = product.clothingSize?.clothingColor;
  const reference = clothingColor?.design?.reference || "";
  const colorName = clothingColor?.color?.name || "";
  const seoOverride = getSeoOverrides(reference, colorName, gender);

  // Cadena de prioridad: DB → diccionario → genérico
  const dbSeo = {
    h1: clothingColor?.seo_h1 || null,
    alt: clothingColor?.seo_alt || null,
    description: clothingColor?.seo_desc || null,
    audience: seoOverride?.audience || gender,
  };

  const resolvedH1 = dbSeo.h1 || seoOverride?.h1 || product.name || "Diseño";
  const resolvedAlt = dbSeo.alt || seoOverride?.alt || product.name;
  const resolvedDescription = dbSeo.description || seoOverride?.description || product.description;

  const breadcrumbItems = [
    { label: 'Inicio', href: '/' },
    { label: gender, href: `/${genderSlug}` },
    { label: resolvedH1, href: `/${genderSlug}` },
  ];

  const imageUrl = product.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url || product.image_url;

  // Construct a merged seoOverride to pass to ProductDetail
  const mergedSeo = {
    title: clothingColor?.seo_title || seoOverride?.title || product.name || 'Two Six',
    description: resolvedDescription,
    h1: resolvedH1,
    alt: resolvedAlt,
    audience: dbSeo.audience,
  };

  // JSON-LD Product structured data for Google rich snippets
  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: resolvedH1,
    description: resolvedDescription,
    image: imageUrl,
    audience: mergedSeo.audience ? {
      "@type": "Audience",
      "audienceType": mergedSeo.audience
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
        seoOverride={mergedSeo} 
      />
    </div>
  );
}

