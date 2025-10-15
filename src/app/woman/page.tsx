import type { Product } from '@/types';
import Catalog from "@/components/Catalog";
import Banner from '@/components/Banner';

// Datos de ejemplo para la categoría de mujer.
const mockProducts: Product[] = [
  { id: 5, name: 'Blusa Elegante', price: 50.00, imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80', category: 'mujer' },
  { id: 6, name: 'Jeans Skinny', price: 65.00, imageUrl: 'https://images.unsplash.com/photo-1603217041431-9a99374797c3?w=500&q=80', category: 'mujer' },
  { id: 7, name: 'Vestido de Verano', price: 75.00, imageUrl: 'https://images.unsplash.com/photo-1595531233000-4285a3a18173?w=500&q=80', category: 'mujer' },
  { id: 8, name: 'Sandalias de Cuero', price: 90.00, imageUrl: 'https://images.unsplash.com/photo-1603487742131-411a79232f85?w=500&q=80', category: 'mujer' },
];

export default function Woman() {
  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1512412046876-f386342eddb3?w=1200&q=80"
        title="Colección para Mujer"
      />
      <Catalog products={mockProducts} />
    </>
  );
}