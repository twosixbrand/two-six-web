import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

export default async function WomanPage() {
  // Obtenemos productos de la categoría MUJER que no sean de OUTLET
  const products = await getStoreDesigns({ gender: 'FEMENINO', isOutlet: false });

  return (
    <>
      <SectionBanner
        imageSrc="https://images.unsplash.com/photo-1445205170230-053b83016050?q=80&w=2071&auto=format&fit=crop"
        title="Mujer"
        subtitle="Elegancia, comodidad y versatilidad."
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} />
      </div>
    </>
  );
}
