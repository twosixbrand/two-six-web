import Image from 'next/image';
import Link from 'next/link';
import type { Product } from '@/types';

interface ProductCardProps {
  product: Product;
}

const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <Link href={`/product/${product.id}`} className="group block overflow-hidden">
      <div className="relative h-[350px] sm:h-[450px]">
        <Image
          src={product.imageUrl}
          alt={product.name}
          fill
          className="absolute inset-0 h-full w-full object-cover opacity-100 transition-opacity group-hover:opacity-80 rounded-md"
        />
      </div>
      <div className="relative mt-3">
        <h3 className="text-sm text-primary/90 group-hover:underline group-hover:underline-offset-4">{product.name}</h3>
        <p className="mt-1.5 tracking-wider text-primary font-semibold">${product.price.toFixed(2)}</p>
      </div>
    </Link>
  );
};

export default ProductCard;