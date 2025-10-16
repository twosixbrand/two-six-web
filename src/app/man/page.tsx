import Catalog from "@/components/Catalog";
import Banner from "@/components/Banner";
import { getProductsByCategory } from '@/data/products';

export default function ManPage() {
  const products = getProductsByCategory('hombre');

  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80"
        title="Colección para Hombre"
      />
      <Catalog products={products} />
    </>
  );
}
