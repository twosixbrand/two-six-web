import { HeroCarousel } from "@/components/HeroCarousel";
import Catalog from "@/components/Catalog";
import { getStoreDesigns } from "@/data/products";
import Link from "next/link";
import Image from "next/image";

export const dynamic = 'force-dynamic';

export default async function HomePage() {
  const productsResponse = await getStoreDesigns({});
  const products = productsResponse.data;

  return (
    <>
      <HeroCarousel />

      {/* Sección Bento Grid de Categorías */}
      <section className="container mx-auto px-6 py-20">
        <div className="flex flex-col items-center mb-12 text-center">
          <h2 className="text-3xl md:text-5xl font-serif text-primary mb-4 tracking-tight">
            Descubre tu Estilo
          </h2>
          <p className="text-muted-foreground text-lg max-w-2xl mt-2">
            Colecciones curadas para cada aspecto de tu vida.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 h-auto md:h-[600px]">
          {/* Card Hombre */}
          <Link href="/man" className="group relative block overflow-hidden rounded-2xl h-[300px] md:h-auto md:col-span-1 lg:col-span-2 md:row-span-2">
            <Image
              src="https://twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com/twosixweb.com/home-hombre-1.png"
              alt="Colección Hombre"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 66vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
            <div className="absolute inset-x-0 bottom-0 p-8 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-3xl font-serif text-white font-bold mb-2">Hombre</h3>
              <span className="text-white/90 text-sm tracking-widest uppercase border-b border-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                Ver Colección
              </span>
            </div>
          </Link>

          {/* Card Mujer */}
          <Link href="/woman" className="group relative block overflow-hidden rounded-2xl h-[300px] md:h-auto">
            <Image
              src="https://twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com/twosixweb.com/home-mujer-1.png"
              alt="Colección Mujer"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover object-top transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-2xl font-serif text-white font-bold mb-2">Mujer</h3>
              <span className="text-white/90 text-sm tracking-widest uppercase border-b border-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                Ver Colección
              </span>
            </div>
          </Link>

          {/* Card Unisex / Outlet */}
          <Link href="/unisex" className="group relative block overflow-hidden rounded-2xl h-[300px] md:h-auto">
            <Image
              src="https://twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com/twosixweb.com/home-uisex-1.png"
              alt="Colección Unisex"
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
              className="object-cover transition-transform duration-700 group-hover:scale-105"
            />
            <div className="absolute inset-0 bg-black/30 group-hover:bg-black/40 transition-colors"></div>
            <div className="absolute inset-x-0 bottom-0 p-6 flex flex-col items-start translate-y-4 group-hover:translate-y-0 transition-transform duration-500">
              <h3 className="text-2xl font-serif text-white font-bold mb-2">Unisex</h3>
              <span className="text-white/90 text-sm tracking-widest uppercase border-b border-white opacity-0 group-hover:opacity-100 transition-opacity duration-500 delay-100">
                Ver Colección
              </span>
            </div>
          </Link>
        </div>
      </section>

      {/* Sección Catálogo Destacado */}
      <section className="bg-secondary/30 mt-12 py-20 border-t border-accent/10">
        <div className="container mx-auto px-6">
          <div className="flex flex-col items-center mb-16 text-center">
            <span className="text-accent text-sm font-semibold tracking-widest uppercase mb-3">
              Selección Exclusiva
            </span>
            <h2 className="text-3xl md:text-5xl font-serif text-primary">
              Novedades
            </h2>
          </div>
          <Catalog products={products} meta={productsResponse.meta} />

          <div className="flex justify-center mt-12">
            <Link
              href="/catalog"
              className="inline-flex items-center justify-center px-8 py-4 text-sm font-medium uppercase tracking-widest text-primary border border-primary hover:bg-primary hover:text-white transition-colors duration-300"
            >
              Ver Todo el Catálogo
            </Link>
          </div>
        </div>
      </section>
    </>
  );
}