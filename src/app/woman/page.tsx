import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

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
        imageSrc="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
        title="Mujer"
        subtitle="Elegancia, comodidad y versatilidad."
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} suggestedProducts={suggestedProducts} meta={meta} />
      </div>
    </>
  );
}
