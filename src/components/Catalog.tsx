import type { Product } from "@/types";
import ProductCard from "./ProductCard";

interface CatalogProps {
  products: Product[];
}

const Catalog = ({ products }: CatalogProps) => {
  return (
    <div className="grid grid-cols-2 gap-x-6 gap-y-10 sm:grid-cols-3 lg:grid-cols-4">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Catalog;
