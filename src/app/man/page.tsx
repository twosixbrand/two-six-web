import Catalog from "@/components/Catalog";
import Banner from "@/components/Banner";
import { prisma } from "@/lib/db";

export default async function ManPage() {
  const products = await prisma.product.findMany({ where: { category: 'HOMBRE' } });

  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80"
        title="Colección para Hombre"
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} />
      </div>
    </>
  );
}