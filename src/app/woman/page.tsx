import Catalog from "@/components/Catalog";
import Banner from "@/components/Banner";
import { getProductsByCategory } from "@/data/products";

export default function WomanPage() {
  const products = getProductsByCategory("mujer");

  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1512412046876-f386342eddb3?w=1200&q=80"
        title="Colección para Mujer"
      />
      <Catalog products={products} />
    </>
  );
}
