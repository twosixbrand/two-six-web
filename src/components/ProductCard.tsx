'use client';

import Image from 'next/image';
import Link from 'next/link';
import { useState } from 'react';
import type { StoreDesign } from '@/types/store';

interface ProductCardProps {
  product: StoreDesign;
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
    <Link href={`/product/${product.id_product}`} className="group block text-center">
      {/* Contenedor para el efecto de zoom */}
      <div className="relative overflow-hidden rounded-xl border border-transparent group-hover:border-gray-200/60 group-hover:shadow-xl group-hover:shadow-black/5 transition-all duration-500 ease-out">
        <Image
          src={imgSrc}
          alt={product.name}
          width={500}
          height={650}
          className="w-full h-full object-contain object-center bg-gray-100/30 aspect-[3/4] transition-transform duration-700 ease-out group-hover:scale-105"
          onError={() => setImgSrc('/placeholder.png')}
        />
      </div>
      <div className="mt-5 mb-2 px-2">
        <h3 className="text-sm md:text-base font-medium text-muted-foreground group-hover:text-accent transition-colors duration-300 tracking-wide line-clamp-1">
          {product.name}
        </h3>
        <p className="mt-1.5 text-lg font-semibold text-primary">
          {formattedPrice}
        </p>
      </div>
    </Link>
  );
};

export default ProductCard;