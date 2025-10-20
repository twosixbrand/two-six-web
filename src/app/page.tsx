import Banner from "@/components/Banner";
import Catalog from "@/components/Catalog";
import { prisma } from "@/lib/db";

export default async function HomePage() {
  // En un caso real, filtrarías por productos con descuento.
  // Por ahora, tomaremos los 4 primeros productos como ejemplo.
  const products = await prisma.product.findMany({
    take: 4,
  });

  return (
    <>
      <Banner
        imageUrl="/banner-two-six.png"
        title=""
        subtitle=""
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} />
      </div>
    </>
  );
}