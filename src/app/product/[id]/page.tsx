import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById } from '@/data/products';

// Esta función genera metadatos dinámicos para el <head> de la página
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = getProductById(Number(params.id));

  if (!product) {
    return {
      title: 'Producto no encontrado',
    };
  }

  return {
    title: `${product.name} | two-six-web`,
    description: product.description,
  };
}

export default function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = getProductById(Number(params.id));

  // Si el producto no existe, muestra la página 404 de Next.js
  if (!product) {
    notFound();
  }

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL'];

  return (
    <section className="py-8 md:py-16">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-16">
        {/* Columna de la Imagen */}
        <div className="relative aspect-square">
          <Image
            src={product.imageUrl}
            alt={product.name}
            fill
            className="object-cover rounded-lg shadow-lg"
          />
        </div>

        {/* Columna de Información */}
        <div className="flex flex-col justify-center">
          <h1 className="text-3xl md:text-4xl font-bold text-primary">{product.name}</h1>
          <p className="mt-2 text-2xl font-semibold text-accent">${product.price.toFixed(2)}</p>
          
          <p className="mt-4 text-base text-primary/80 leading-relaxed">{product.description}</p>

          {/* Selector de Tallas */}
          <div className="mt-6">
            <h3 className="text-sm font-medium text-primary">Talla:</h3>
            <div className="flex flex-wrap gap-2 mt-2">
              {availableSizes.map((size) => (
                <button 
                  key={size} 
                  className="px-4 py-2 border border-gray-300 rounded-md text-sm hover:border-primary focus:border-accent focus:ring-1 focus:ring-accent transition-colors"
                >
                  {size}
                </button>
              ))}
            </div>
          </div>

          {/* Botón de Añadir al Carrito */}
          <button className="mt-8 w-full bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-300 shadow-md">
            Añadir al Carrito
          </button>
        </div>
      </div>
    </section>
  );
}