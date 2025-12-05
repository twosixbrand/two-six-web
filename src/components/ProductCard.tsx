'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  const [imgSrc, setImgSrc] = useState(product.image_url || '/placeholder.png');

  // Formatea el precio a la moneda local (Peso Colombiano) sin decimales.
  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <Link href={`/product/${product.id}`} className="group block text-center">
      {/* Contenedor para el efecto de zoom */}
      <div className="relative overflow-hidden rounded-lg">
        <Image
          src={imgSrc}
          alt={product.name}
          width={500}
          height={650}
          className="w-full object-cover aspect-[3/4] transition-transform duration-300 ease-in-out group-hover:scale-105"
          onError={() => setImgSrc('/placeholder.png')}
        />
      </div>
      <div className="mt-4">
        <h3 className="text-base text-primary/90 font-medium group-hover:text-accent transition-colors">
          {product.name}
        </h3>
        <p className="mt-2 text-lg font-semibold text-primary">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;