import type { Metadata } from 'next';
import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const revalidate = 3600; // ISR: regenerate every hour

export const metadata: Metadata = {
  title: 'Ropa Urbana para Hombre | Camisetas y Pantalones',
  description: 'Eleva tu estilo con la colección masculina de Two Six. Camisetas de alto gramaje en Medellín. Calidad premium, estilo minimalista. Envíos nacionales.',
  keywords: 'ropa urbana hombre, camisetas hombre Medellín, hoddies urbanos',
  alternates: { canonical: '/man' },
  openGraph: {
    title: 'Ropa Urbana para Hombre | Camisetas y Pantalones | Two Six',
    description: 'Eleva tu estilo con la colección masculina de Two Six. Camisetas de alto gramaje en Medellín. Calidad premium, estilo minimalista. Envíos nacionales.',
    url: '/man',
  },
};

export default async function ManPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const pageParam = typeof resolvedParams.page === 'string' ? resolvedParams.page : '1';
  const pageNumber = parseInt(pageParam, 10) || 1;

  // Obtenemos productos de la categoría HOMBRE que no sean de OUTLET
  const productsResponse = await getStoreDesigns({ gender: 'MASCULINO', isOutlet: false, category, page: pageNumber });
  const products = productsResponse.data;
  const meta = productsResponse.meta;

  let suggestedProducts: any[] = [];
  if (products.length === 0 && category) {
    const allManProductsResponse = await getStoreDesigns({ gender: 'MASCULINO', isOutlet: false, limit: 4 });
    // Tomamos las primeras 4 prendas de la categoría principal como sugeridas
    suggestedProducts = allManProductsResponse.data;
  }

  // ItemList JSON-LD for Google product carousel rich results
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Colección Hombre Two Six',
    description: 'Ropa urbana para hombre. Camisetas, hoodies y más con estilo streetwear.',
    numberOfItems: products.length,
    itemListElement: products.map((product, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      url: `https://twosixweb.com/product/${product.slug || product.id_product}`,
      name: product.name,
      image: product.image_url,
    })),
  };

  return (
    <>
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(itemListJsonLd) }}
      />
      <SectionBanner
        imageSrc="https://twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com/twosixweb.com/banner-hombre.png"
        title="Hombre"
        subtitle="Diseños exclusivos para el hombre contemporáneo"
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} suggestedProducts={suggestedProducts} meta={meta} />
      </div>
    </>
  );
}