import type { Product } from '@/types';

export const products: Product[] = [
  // Hombre
  {
    id: 1,
    name: "Camisa Casual de Lino",
    price: 45.0,
    imageUrl: "https://images.unsplash.com/photo-1618354691373-d851c5c3a990?w=500&q=80",
    category: "hombre",
    description: "Una camisa de lino ligera y transpirable, perfecta para climas cálidos. Su corte moderno y tejido de alta calidad la convierten en un básico imprescindible en cualquier armario.",
  },
  {
    id: 2,
    name: "Pantalón Chino Slim Fit",
    price: 60.0,
    imageUrl: "https://images.unsplash.com/photo-1604176354204-9268737828e4?w=500&q=80",
    category: "hombre",
    description: "Pantalón chino de corte slim fit, fabricado con algodón elástico para mayor comodidad. Versátil y elegante, ideal tanto para la oficina como para el fin de semana.",
  },
  // ... más productos de hombre

  // Mujer
  { 
    id: 5, 
    name: 'Blusa Elegante de Seda', 
    price: 50.00, 
    imageUrl: 'https://images.unsplash.com/photo-1594633312681-425c7b97ccd1?w=500&q=80', 
    category: 'mujer',
    description: "Blusa de seda con un tacto suave y una caída impecable. Su diseño minimalista y cuello en V la hacen perfecta para cualquier ocasión, desde una reunión de trabajo hasta una cena especial."
  },
  { 
    id: 6, 
    name: 'Jeans Skinny de Tiro Alto', 
    price: 65.00, 
    imageUrl: 'https://images.unsplash.com/photo-1603217041431-9a99374797c3?w=500&q=80', 
    category: 'mujer',
    description: "Jeans skinny de tiro alto que realzan la figura. Fabricados con un tejido denim elástico que ofrece comodidad y estilo durante todo el día."
  },
  // ... más productos de mujer
];

export const getProductsByCategory = (category: 'hombre' | 'mujer') => {
  return products.filter(product => product.category === category);
};

export const getProductById = (id: number) => {
  return products.find(product => product.id === id);
};