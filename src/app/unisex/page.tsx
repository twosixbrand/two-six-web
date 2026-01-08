import Catalog from "@/components/Catalog";
import Banner from "@/components/Banner";
import { getStoreDesigns } from "@/data/products";

export default async function UnisexPage() {
  // Obtenemos productos de la categoría MUJER que no sean de OUTLET
  const products = await getStoreDesigns({ gender: 'UNISEX', isOutlet: false });

  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1512412046876-f386342eddb3?w=1200&q=80"
        title="Colección Unisex"
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} />
      </div>
    </>
  );
}
