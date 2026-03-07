import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

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
        imageSrc="https://images.unsplash.com/photo-1492446845049-9c50cc313f00?q=80&w=1974&auto=format&fit=crop"
        title="Unisex"
        subtitle="Prendas estéticas sin definiciones."
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} suggestedProducts={suggestedProducts} meta={meta} />
      </div>
    </>
  );
}
