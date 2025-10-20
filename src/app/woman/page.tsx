import Catalog from "@/components/Catalog";
import Banner from "@/components/Banner";
import { prisma } from "@/lib/db";

export default async function WomanPage() {
  const products = await prisma.product.findMany({ where: { category: 'MUJER' } });

  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1512412046876-f386342eddb3?w=1200&q=80"
        title="Colección para Mujer"
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} />
      </div>
    </>
  );
}
