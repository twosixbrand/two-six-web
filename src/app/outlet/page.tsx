import type { Metadata } from 'next';
import Catalog from "@/components/Catalog";
import { SectionBanner } from "@/components/SectionBanner";
import { getStoreDesigns } from "@/data/products";

export const revalidate = 3600; // ISR: regenerate every hour

export const metadata: Metadata = {
  title: 'Outlet - Descuentos Exclusivos',
  description: 'Aprovecha los descuentos exclusivos del Outlet Two Six. Piezas atemporales a precios únicos. Stock limitado.',
  alternates: { canonical: '/outlet' },
  openGraph: {
    title: 'Outlet | Two Six',
    description: 'Oportunidades únicas de piezas atemporales a precios especiales.',
    url: '/outlet',
  },
};

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
        <Catalog products={products.data} meta={products.meta} />
      </div>
    </>
  );
}
