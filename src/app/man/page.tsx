import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const dynamic = 'force-dynamic';

export default async function ManPage() {
  // Obtenemos productos de la categoría HOMBRE que no sean de OUTLET
  const products = await getStoreDesigns({ gender: 'MASCULINO', isOutlet: false });

  return (
    <>
      <SectionBanner
        imageSrc="https://images.unsplash.com/photo-1516257984-b1b4d707412e?q=80&w=2070&auto=format&fit=crop"
        title="Hombre"
        subtitle="Diseños exclusivos para el hombre contemporáneo"
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} />
      </div>
    </>
  );
}