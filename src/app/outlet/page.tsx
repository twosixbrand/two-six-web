import Catalog from "@/components/Catalog";
import Banner from "@/components/Banner";
import { getStoreDesigns } from "@/data/products";

export default async function OutletPage() {
  // Obtenemos todos los diseños que están marcados como outlet
  const products = await getStoreDesigns({ isOutlet: true });
  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1567401893414-76b7b1e5a7a5?w=1200&q=80"
        //src="/logo.png"
        title="Outlet"
        subtitle="Grandes descuentos en tus prendas favoritas"
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} />
      </div>
    </>
  );
}
