import Image from 'next/image';
import { notFound } from 'next/navigation';
import { getProductById } from '@/data/products';

// Esta función genera metadatos dinámicos para el <head> de la página
export async function generateMetadata({ params }: { params: { id: string } }) {
  const product = await getProductById(Number(params.id));

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

export default async function ProductDetailPage({ params }: { params: { id: string } }) {
  const product = await getProductById(Number(params.id));

  // Si el producto no existe, muestra la página 404 de Next.js
  if (!product) {
    notFound();
  }

  const availableSizes = ['XS', 'S', 'M', 'L', 'XL'];

  const formattedPrice = new Intl.NumberFormat('es-CO', {
    style: 'currency',
    currency: 'COP',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(product.price);

  return (
    <section className="bg-secondary py-12 md:py-20">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Columna de la Imagen (ocupa 2 de 5 columnas en LG) */}
          <div className="lg:col-span-2">
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg">
              <Image
                src={product.imageUrl}
                alt={product.name}
                fill
                className="object-cover"
              />
            </div>
          </div>

          {/* Columna de Información (ocupa 3 de 5 columnas en LG) */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">{product.name}</h1>
            <p className="mt-2 text-2xl font-semibold text-accent">{formattedPrice}</p>
            
            <p className="mt-6 text-lg text-primary/80 leading-relaxed">{product.description}</p>

            {/* Selector de Tallas */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-primary mb-2">Talla:</h3>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => (
                  <button 
                    key={size} 
                    className="w-12 h-12 border border-gray-300 rounded-md text-sm font-medium transition-colors
                               hover:border-primary 
                               focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2
                               data-[selected=true]:bg-primary data-[selected=true]:text-white data-[selected=true]:border-primary"
                    // Ejemplo de cómo manejar el estado seleccionado (requiere un estado de React)
                    // onClick={() => setSelectedSize(size)}
                    // data-selected={selectedSize === size}
                  >
                    {size}
                  </button>
                ))}
              </div>
            </div>

            {/* Botón de Añadir al Carrito */}
            <button className="mt-10 w-full max-w-xs bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-300 shadow-md">
              Añadir al Carrito
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}