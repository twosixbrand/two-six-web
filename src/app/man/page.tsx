import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

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
        imageSrc="https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=2070&auto=format&fit=crop"
        title="Hombre"
        subtitle="Diseños exclusivos para el hombre contemporáneo"
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} suggestedProducts={suggestedProducts} meta={meta} />
      </div>
    </>
  );
}