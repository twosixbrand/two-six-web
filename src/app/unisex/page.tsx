import type { Metadata } from 'next';
import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Ropa Unisex',
  description: 'Colección unisex Two Six. Streetwear sin género con diseños atrevidos y cómodos. Envíos a toda Colombia.',
  alternates: { canonical: '/unisex' },
  openGraph: {
    title: 'Ropa Unisex | Two Six',
    description: 'Streetwear sin género. Diseños atrevidos y cómodos para todos.',
    url: '/unisex',
  },
};

export default async function UnisexPage({
  searchParams,
}: {
  searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
  const resolvedParams = await searchParams;
  const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
  const pageParam = typeof resolvedParams.page === 'string' ? resolvedParams.page : '1';
  const pageNumber = parseInt(pageParam, 10) || 1;

  // Obtenemos productos de la categoría UNISEX que no sean de OUTLET
  const productsResponse = await getStoreDesigns({ gender: 'UNISEX', isOutlet: false, category, page: pageNumber });
  const products = productsResponse.data;
  const meta = productsResponse.meta;

  let suggestedProducts: any[] = [];
  if (products.length === 0 && category) {
    const allUnisexProductsResponse = await getStoreDesigns({ gender: 'UNISEX', isOutlet: false, limit: 4 });
    suggestedProducts = allUnisexProductsResponse.data;
  }

  return (
    <>
      <SectionBanner
        imageSrc="https://twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com/twosixweb.com/banner-unisex.png"
        title="Unisex"
        subtitle="Prendas estéticas sin definiciones."
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} suggestedProducts={suggestedProducts} meta={meta} />
      </div>
    </>
  );
}
