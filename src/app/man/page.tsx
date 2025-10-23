import Catalog from "@/components/Catalog";
import Banner from "@/components/Banner";
import { getProducts } from "@/data/products";

export default async function ManPage() {
  // Obtenemos productos de la categoría HOMBRE que no sean de OUTLET
  const products = await getProducts({ gender: 'HOMBRE', isOutlet: false });

  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80"
        title="Colección para Hombre"
      />
      <div className="container mx-auto px-6 py-12">
        <Catalog products={products} />
      </div>
    </>
  );
}