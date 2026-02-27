import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

export default async function OutletPage() {
  // Obtenemos todos los diseños que están marcados como outlet
  const products = await getStoreDesigns({ isOutlet: true });
  return (
    <>
      <SectionBanner
        imageSrc="https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?q=80&w=2070&auto=format&fit=crop"
        title="Outlet"
        subtitle="Oportunidades únicas de piezas atemporales."
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} />
      </div>
    </>
  );
}
