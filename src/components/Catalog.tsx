import type { StoreDesign } from '@/types/store';
import ProductCard from './ProductCard';
import { PackageOpen } from 'lucide-react';
import Link from 'next/link';
import PaginationControls from './PaginationControls';

interface CatalogProps {
  products: StoreDesign[];
  emptyMessage?: string;
  suggestedProducts?: StoreDesign[];
  meta?: {
    page: number;
    totalPages: number;
  };
}

const Catalog = ({ products, emptyMessage = "No se encontraron prendas en esta sección.", suggestedProducts = [], meta }: CatalogProps) => {
  if (!products || products.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-24 px-4 text-center">
        <div className="bg-gray-50 rounded-full p-6 mb-6 border border-gray-100 shadow-sm">
          <PackageOpen className="w-12 h-12 text-gray-400" strokeWidth={1} />
        </div>
        <h3 className="text-2xl font-serif text-gray-900 mb-3">
          Estamos preparando nuevas prendas
        </h3>
        <p className="text-gray-500 max-w-md mb-8 leading-relaxed">
          {emptyMessage} Mientras tanto, puedes explorar las demás categorías para descubrir nuestras colecciones.
        </p>
        <Link
          href="/"
          className="inline-flex items-center justify-center px-8 py-3 border border-transparent text-sm font-medium uppercase tracking-wider rounded-md text-white bg-primary hover:bg-accent transition-all duration-300 shadow-sm hover:shadow-md"
        >
          Ir Al Inicio
        </Link>

        {suggestedProducts.length > 0 && (
          <div className="mt-20 w-full text-left">
            <h4 className="text-xl font-serif text-gray-900 mb-6 border-b pb-2">
              También te podría interesar
            </h4>
            <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 text-left">
              {suggestedProducts.map((product) => (
                <ProductCard key={product.id_design} product={product} />
              ))}
            </div>
          </div>
        )}
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6">
        {products.map((product) => (
          <ProductCard key={product.id_design} product={product} />
        ))}
      </div>

      {meta && meta.totalPages > 1 && (
        <PaginationControls currentPage={meta.page} totalPages={meta.totalPages} />
      )}
    </>
  );
};

export default Catalog;