import type { StoreDesign } from '@/types/store';
import ProductCard from './ProductCard';

interface CatalogProps {
  products: StoreDesign[];
}

const Catalog = ({ products }: CatalogProps) => {
  return (
    <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
      {products.map((product) => (
        <ProductCard key={product.id_design} product={product} />
      ))}
    </div>
  );
};

export default Catalog;