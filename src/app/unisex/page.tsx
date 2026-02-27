import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

export default async function UnisexPage() {
  // Obtenemos productos de la categoría MUJER que no sean de OUTLET
  const products = await getStoreDesigns({ gender: 'UNISEX', isOutlet: false });

  return (
    <>
      <SectionBanner
        imageSrc="https://images.unsplash.com/photo-1492446845049-9c50cc313f00?q=80&w=1974&auto=format&fit=crop"
        title="Unisex"
        subtitle="Prendas estéticas sin definiciones."
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} />
      </div>
    </>
  );
}
