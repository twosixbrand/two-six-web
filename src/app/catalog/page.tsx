import type { Metadata } from 'next';
import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Catálogo Completo',
  description: 'Explora el catálogo completo de Two Six. Camisetas, hoodies, joggers y más. Ropa colombiana con envíos a todo el país.',
  alternates: { canonical: '/catalog' },
  openGraph: {
    title: 'Catálogo Completo | Two Six',
    description: 'Toda la colección Two Six en un solo lugar. Encuentra tu estilo.',
    url: '/catalog',
  },
};

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
                imageSrc="https://twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com/twosixweb.com/banner-catalogo.png"
                title="Catálogo Completo"
                subtitle="Explora todas nuestras colecciones."
            />
            <div className="container mx-auto px-6 py-12">
                <Catalog products={products} meta={meta} />
            </div>
        </>
    );
}
