import type { Metadata } from 'next';
import { getProductsBySlug, getProductById, getStoreDesigns } from "@/data/products";
import ProductDetail from "@/components/ProductDetail";
import Breadcrumbs from "@/components/Breadcrumbs";
import { notFound, permanentRedirect } from "next/navigation";
import { getSeoOverrides } from '@/utils/seoDictionary';

export const revalidate = 3600; // ISR: regenerate every hour

// Pre-generate static pages for all known product slugs at build time
export async function generateStaticParams() {
  try {
    const res = await getStoreDesigns();
    return (res.data || [])
      .filter((p) => p.slug)
      .map((p) => ({ slug: p.slug }));
  } catch {
    return [];
  }
}

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
      title: title,
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
      title: title,
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
         // permanentRedirect sends a 308 which Google treats identically to 301
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
  // TODO: Add "aggregateRating" and "review" once real user reviews are collected.
  //       Google Search Console flags these as missing but they must NOT be faked.
  //       Implement a review collection system and then add:
  //       aggregateRating: { '@type': 'AggregateRating', ratingValue: X, reviewCount: Y }
  //       review: [{ '@type': 'Review', author: {...}, reviewRating: {...}, reviewBody: '...' }]

  // Map gender to Google's expected suggestedGender values
  const suggestedGenderMap: Record<string, string> = {
    'femenino': 'female',
    'masculino': 'male',
    'unisex': 'unisex',
  };
  const suggestedGender = suggestedGenderMap[(mergedSeo.audience || '').toLowerCase()] || 'unisex';

  const productJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Product',
    name: resolvedH1,
    description: resolvedDescription,
    image: imageUrl,
    color: colorName || undefined,
    audience: {
      '@type': 'PeopleAudience',
      suggestedGender: suggestedGender,
    },
    brand: {
      '@type': 'Brand',
      name: 'Two Six',
    },
    offers: {
      '@type': 'Offer',
      url: `https://twosixweb.com/product/${slug}`,
      priceCurrency: 'COP',
      price: product.price,
      priceValidUntil: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000).toISOString().split('T')[0],
      itemCondition: 'https://schema.org/NewCondition',
      availability: product.clothingSize?.quantity_available > 0
        ? 'https://schema.org/InStock'
        : 'https://schema.org/OutOfStock',
      seller: {
        '@type': 'Organization',
        name: 'Two Six',
      },
      hasMerchantReturnPolicy: {
        '@type': 'MerchantReturnPolicy',
        applicableCountry: 'CO',
        returnPolicyCategory: 'https://schema.org/MerchantReturnFiniteReturnWindow',
        merchantReturnDays: 30,
        returnMethod: 'https://schema.org/ReturnByMail',
        returnFees: 'https://schema.org/FreeReturn',
      },
      shippingDetails: {
        '@type': 'OfferShippingDetails',
        shippingDestination: {
          '@type': 'DefinedRegion',
          addressCountry: 'CO',
        },
        shippingRate: {
          '@type': 'MonetaryAmount',
          value: 8000,
          currency: 'COP',
        },
        freeShippingThreshold: {
          '@type': 'MonetaryAmount',
          value: 150000,
          currency: 'COP',
        },
        deliveryTime: {
          '@type': 'ShippingDeliveryTime',
          handlingTime: { '@type': 'QuantitativeValue', minValue: 1, maxValue: 2, unitCode: 'DAY' },
          transitTime: { '@type': 'QuantitativeValue', minValue: 2, maxValue: 5, unitCode: 'DAY' },
        },
      },
    },
  };

  // BreadcrumbList JSON-LD for Google rich navigation snippets
  const breadcrumbJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbItems.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: index < breadcrumbItems.length - 1 ? `https://twosixweb.com${item.href}` : undefined,
    })),
  };

  return (
    <div className="container mx-auto px-4 sm:px-6 lg:px-8">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(productJsonLd) }}
      />
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(breadcrumbJsonLd) }}
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

