import type { Metadata } from 'next';
import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ropa para Mujer',
  description: 'Colección de ropa para mujer Two Six. Prendas con estilo urbano, comodidad y versatilidad. Envíos a toda Colombia.',
  alternates: { canonical: '/woman' },
  openGraph: {
    title: 'Ropa para Mujer | Two Six',
    description: 'Elegancia, comodidad y versatilidad. Streetwear colombiano para la mujer moderna.',
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

  return (
    <>
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
