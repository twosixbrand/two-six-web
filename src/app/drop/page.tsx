import type { Metadata } from 'next';
import Image from 'next/image';
import Link from 'next/link';
import { Truck, CreditCard, RefreshCcw, CheckCircle2 } from 'lucide-react';
import { getStoreDesigns } from '@/data/products';
import ProductCard from '@/components/ProductCard';
import TrackingButton from './TrackingButton';

export const metadata: Metadata = {
  title: 'Nuevo Drop | Two Six',
  description: 'Descubre nuestra primera entrega de Streetwear Premium. Tela fría, textura catar premium y unidades limitadas. Diseñadas para quienes no negocian la excelencia.',
};

// Revalidate to ensure page is statically optimized but regenerates for product stock updates.
export const revalidate = 3600;

export default async function DropLandingPage() {
  // Fetch up to 3 latest designs for the showcase (assuming they are set to appear in the new drop)
  const recentDesigns = await getStoreDesigns({ tag: 'nuevo-drop', limit: 12 });
  const products = recentDesigns.data;

  return (
    <div className="flex flex-col min-h-screen text-white selection:bg-accent/40 bg-[radial-gradient(ellipse_at_center,_var(--tw-gradient-stops))] from-[#111111] to-black">
      
      {/* 1. Hero (Atención) */}
      <section className="relative w-full h-[90vh] min-h-[600px] flex items-center justify-center overflow-hidden">
        {products.length > 0 && products[0].image_url ? (
          <Image 
            src={products[0].image_url}
            alt={products[0].name || "Premium Streetwear Hero"}
            fill
            priority
            className="object-cover object-center opacity-40 mix-blend-overlay transition-transform duration-1000 scale-105 hover:scale-100"
          />
        ) : (
          <Image 
            src="/og-image.jpg" // Fallback seguro
            alt="Premium Streetwear Hero"
            fill
            priority
            className="object-cover object-center opacity-40 mix-blend-overlay transition-transform duration-1000 scale-105 hover:scale-100"
          />
        )}
        <div className="absolute inset-0 bg-gradient-to-b from-black/20 via-black/50 to-black pointer-events-none" />
        
        <div className="relative z-10 text-center px-6 max-w-4xl mx-auto mt-20 animate-in fade-in slide-in-from-bottom-8 duration-1000">
          <span className="inline-block px-4 py-1.5 mb-6 text-xs font-semibold tracking-[0.2em] text-black bg-white uppercase rounded-sm">
            Primera Entrega
          </span>
          <h1 className="text-5xl md:text-7xl font-bold tracking-tighter mb-6 bg-clip-text text-transparent bg-gradient-to-br from-white to-gray-400 text-balance">
            Calidad que impone. Estilo que perdura.
          </h1>
          <p className="text-lg md:text-xl text-gray-300 mb-10 max-w-2xl mx-auto leading-relaxed">
            No es solo ropa, es un estándar. Descubre nuestra primera entrega de Streetwear Premium diseñada para quienes no negocian la excelencia.
          </p>
          <Link 
            href="/catalog?tag=nuevo-drop"
            className="group relative inline-flex items-center justify-center w-full md:w-auto px-12 py-4 font-bold text-black bg-white transition-all rounded-lg overflow-hidden shadow-[0_0_30px_rgba(255,255,255,0.15)] hover:shadow-[0_0_50px_rgba(255,255,255,0.3)] hover:bg-gray-200"
          >
            <span className="tracking-[0.1em] text-sm transition-transform duration-300 group-hover:-translate-y-0.5">
              EXPLORAR EL DROP
            </span>
          </Link>
        </div>
      </section>

      {/* 2. El Diferencial (Interés) */}
      <section className="py-24 px-6 bg-black relative">
        <div className="absolute top-0 inset-x-0 h-px bg-gradient-to-r from-transparent via-white/10 to-transparent" />
        <div className="max-w-6xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Crafted for Real Ones.</h2>
            <p className="text-gray-400 max-w-2xl mx-auto text-lg leading-relaxed">
              No todas las telas se sienten igual. En Two Six, seleccionamos materiales que no solo mantienen su estructura, sino que ofrecen una experiencia térmica superior para el movimiento constante en la ciudad.
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 md:gap-12">
            {[
              {
                title: "Tecnología en Tela Fría",
                desc: "Una caída impecable y frescura máxima. Ideal para quienes buscan una prenda que no se arruga y se siente ligera durante todo el día."
              },
              {
                title: "Textura Catar Premium",
                desc: "Un tejido con carácter y alta durabilidad. Su gramaje y suavidad al tacto definen un nuevo estándar en el streetwear nacional."
              },
              {
                title: "Confección de Alta Precisión",
                desc: "Diseñadas y fabricadas en Colombia, cuidando cada costura para que la prenda resista tu ritmo, no solo una temporada."
              }
            ].map((feature, i) => (
              <div 
                key={i} 
                className="p-8 rounded-2xl bg-white/[0.02] border border-white/5 hover:bg-white/[0.04] transition-colors duration-500 flex flex-col"
              >
                <div className="h-12 w-12 rounded-full bg-white/10 flex items-center justify-center mb-6">
                  <CheckCircle2 className="w-6 h-6 text-white" />
                </div>
                <h3 className="text-xl font-semibold mb-4">{feature.title}</h3>
                <p className="text-gray-400 leading-relaxed">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* 3. La Galería de Producto (Deseo) */}
      {products.length > 0 && (
        <section className="py-24 px-6 bg-[#0a0a0a]">
          <div className="max-w-7xl mx-auto">
            <div className="flex flex-col md:flex-row justify-between items-end mb-12 gap-6">
              <div>
                <h2 className="text-3xl md:text-4xl font-bold tracking-tight mb-4">Piezas esenciales reinventadas<br/>para tu rotación diaria.</h2>
                <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-red-500/10 border border-red-500/20 text-red-400 text-sm font-medium">
                  <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
                  Unidades limitadas por talla. Sin re-stocks garantizados.
                </div>
              </div>
              <Link href="/catalog?tag=nuevo-drop" className="text-sm font-medium hover:text-gray-300 transition-colors border-b border-white/30 pb-1">
                Ver todos los estilos
              </Link>
            </div>

            {/* Reutilizamos el componente de ProductCard con grid de Tailwind */}
            <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-8">
              {products.map((product) => (
                <div key={product.id_product} className="bg-white/5 p-4 rounded-3xl backdrop-blur-sm border border-white/10">
                  <ProductCard product={product} />
                  {/* Se sobreescriben estilos de ProductCard aquí visualmente por el entorno negro */}
                </div>
              ))}
            </div>
          </div>
        </section>
      )}

      {/* 4. La Oferta de Cierre & 5. Trust Bar (Acción) */}
      <section className="py-24 px-6 relative overflow-hidden flex flex-col items-center justify-center">
        {/* Glow Effects */}
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[800px] h-[500px] bg-accent/20 blur-[120px] rounded-full pointer-events-none" />
        
        <div className="relative z-10 max-w-3xl mx-auto text-center bg-white/5 backdrop-blur-md border border-white/10 p-10 md:p-16 rounded-3xl">
          <h2 className="text-3xl md:text-5xl font-bold tracking-tight mb-6">Tu primera pieza Two Six tiene un beneficio.</h2>
          <p className="text-gray-300 text-lg mb-10 leading-relaxed max-w-xl mx-auto">
            Queremos que sientas la calidad por ti mismo. Usa el código <strong className="text-white bg-white/10 px-2 py-1 rounded">FIRST26</strong> y obtén un <strong>10% OFF + Envío Gratis</strong> en tu primer pedido.
          </p>
          
          <TrackingButton 
            text="COMPRAR AHORA"
            className="w-full sm:w-auto px-12 py-5 bg-white text-black text-sm font-bold tracking-[0.15em] rounded-lg hover:bg-gray-200 transition-all active:scale-[0.98] shadow-[0_0_40px_rgba(255,255,255,0.3)] hover:shadow-[0_0_60px_rgba(255,255,255,0.5)]"
          />

          {/* Trust Bar integrando en la oferta para dar el último empujón */}
          <div className="mt-16 pt-10 border-t border-white/10 grid grid-cols-1 md:grid-cols-3 gap-6 text-sm text-gray-400">
            <div className="flex items-center justify-center gap-3">
              <Truck className="w-5 h-5 opacity-70" />
              <span>Envíos nacionales seguros.</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <CreditCard className="w-5 h-5 opacity-70" />
              <span>Paga con PSE, Nequi o T.C.</span>
            </div>
            <div className="flex items-center justify-center gap-3">
              <RefreshCcw className="w-5 h-5 opacity-70" />
              <span>Cambios sin complicaciones.</span>
            </div>
          </div>
        </div>
      </section>
      
    </div>
  );
}
