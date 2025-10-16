import type { Product } from '@prisma/client';
import ProductCard from './ProductCard';

interface CatalogProps {
  products: Product[];
}

const Catalog = ({ products }: CatalogProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};

export default Catalog;