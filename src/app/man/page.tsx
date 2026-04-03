import type { Metadata } from 'next';
import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ropa para Hombre',
  description: 'Descubre la colección de ropa para hombre Two Six. Camisetas, hoodies y más con diseños exclusivos. Envíos a toda Colombia.',
  alternates: { canonical: '/man' },
  openGraph: {
    title: 'Ropa para Hombre | Two Six',
    description: 'Diseños exclusivos para el hombre contemporáneo. Streetwear colombiano con actitud.',
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

  return (
    <>
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