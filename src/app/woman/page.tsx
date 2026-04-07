import type { Metadata } from 'next';
import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const revalidate = 3600; // ISR: regenerate every hour

export const metadata: Metadata = {
  title: 'Streetwear para Mujer | Tops y Moda Urbana',
  description: 'Prendas atemporales para mujer. Tops, camisetas y hoddies con el sello de calidad Two Six. Diseñados para destacar tu esencia. Hecho en Medellín, Colombia.',
  keywords: 'ropa urbana mujer, tops streetwear mujer, moda independiente Medellín',
  alternates: { canonical: '/woman' },
  openGraph: {
    title: 'Streetwear para Mujer | Tops y Moda Urbana | Two Six',
    description: 'Prendas atemporales para mujer. Tops, camisetas y hoddies con el sello de calidad Two Six. Diseñados para destacar tu esencia. Hecho en Medellín, Colombia.',
    url: '/woman',
  },
};

export default async function WomanPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const pageParam = typeof resolvedParams.page === 'string' ? resolvedParams.page : '1';
  const pageNumber = parseInt(pageParam, 10) || 1;

  // Obtenemos productos de la categoría MUJER que no sean de OUTLET
  const productsResponse = await getStoreDesigns({ gender: 'FEMENINO', isOutlet: false, category, page: pageNumber });
  const products = productsResponse.data;
  const meta = productsResponse.meta;

  let suggestedProducts: any[] = [];
  if (products.length === 0 && category) {
    const allWomanProductsResponse = await getStoreDesigns({ gender: 'FEMENINO', isOutlet: false, limit: 4 });
    suggestedProducts = allWomanProductsResponse.data;
  }

  // ItemList JSON-LD for Google product carousel rich results
  const itemListJsonLd = {
    '@context': 'https://schema.org',
    '@type': 'ItemList',
    name: 'Colección Mujer Two Six',
    description: 'Prendas atemporales para mujer. Tops, camisetas y hoodies con sello de calidad Two Six.',
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
        imageSrc="https://twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com/twosixweb.com/banner-mujer-1.png"
        title="Mujer"
        subtitle="Elegancia, comodidad y versatilidad."
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} suggestedProducts={suggestedProducts} meta={meta} />
      </div>
    </>
  );
}
