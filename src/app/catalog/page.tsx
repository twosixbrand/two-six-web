import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

export default async function FullCatalogPage({
    searchParams,
}: {
    searchParams: Promise<{ [key: string]: string | string[] | undefined }>
}) {
    const resolvedParams = await searchParams;
    const category = typeof resolvedParams.category === 'string' ? resolvedParams.category : undefined;
    const pageParam = typeof resolvedParams.page === 'string' ? resolvedParams.page : '1';
    const pageNumber = parseInt(pageParam, 10) || 1;

    // Obtenemos todos los productos (sin filtrar por género)
    const productsResponse = await getStoreDesigns({ isOutlet: false, category, page: pageNumber });
    const products = productsResponse.data;
    const meta = productsResponse.meta;

    return (
        <>
            <SectionBanner
                imageSrc="https://images.unsplash.com/photo-1441984904996-e0b6ba687e04?q=80&w=2070&auto=format&fit=crop"
                title="Catálogo Completo"
                subtitle="Explora todas nuestras colecciones."
            />
            <div className="container mx-auto px-6 py-12">
                <Catalog products={products} meta={meta} />
            </div>
        </>
    );
}
