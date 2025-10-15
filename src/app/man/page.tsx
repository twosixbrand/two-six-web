import type { Product } from "@/types"; // Asegúrate de que este import ahora apunte a tu nuevo archivo de tipos
import Catalog from "@/components/Catalog";
import Banner from "@/components/Banner";

// Datos de ejemplo. Más adelante, esto vendrá de una base de datos o una API.
const mockProducts: Product[] = [
  {
    id: 1,
    name: "Camisa Casual",
    price: 45.0,
    imageUrl:
      "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80",
    category: "hombre",
  },
  {
    id: 2,
    name: "Pantalón Chino",
    price: 60.0,
    imageUrl:
      "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=500&q=80",
    category: "hombre",
  },
  {
    id: 3,
    name: "Sudadera con Capucha",
    price: 55.0,
    imageUrl:
      "https://images.unsplash.com/photo-1556159992-e189f8e5c103?w=500&q=80",
    category: "hombre",
  },
  {
    id: 4,
    name: "Zapatillas Urbanas",
    price: 85.0,
    imageUrl:
      "https://images.unsplash.com/photo-1552346154-21d32810aba3?w=500&q=80",
    category: "hombre",
  },
];

export default function ManPage() {
  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1503341504253-dff4815485f1?w=1200&q=80"
        title="Colección para Hombre"
      />
      <Catalog products={mockProducts} />
    </>
  );
}
