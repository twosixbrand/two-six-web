import Banner from "@/components/Banner";
import Image from "next/image";

export default function AboutPage() {
  return (
    <>
      <Banner
        imageUrl="https://images.unsplash.com/photo-1523961131990-5ea7c61b2107?w=1200&q=80"
        title="Nosotros"
        subtitle="Conoce la historia detrás de Two Six Brand"
      />

      <section className="container mx-auto px-6 py-16 md:py-24">
        <div className="grid md:grid-cols-2 gap-12 lg:gap-16 items-center max-w-6xl mx-auto">
          <div>
            <h2 className="text-3xl md:text-4xl font-bold text-primary mb-6">Nuestra Misión</h2>
            <p className="text-lg text-gray-700 leading-relaxed mb-6">
              En Two Six Brand, nuestra misión es ofrecer moda de alta calidad que no solo te haga lucir bien, sino también sentirte increíble. Creemos en la autoexpresión a través del estilo y nos dedicamos a crear prendas que combinan diseño contemporáneo, comodidad y durabilidad.
            </p>
            <p className="text-lg text-gray-700 leading-relaxed">
              Desde nuestros inicios, nos hemos comprometido con la sostenibilidad y la producción ética. Cada pieza es diseñada con atención al detalle, utilizando materiales seleccionados para minimizar nuestro impacto ambiental y asegurar que recibas un producto que amarás por años.
            </p>
          </div>
          <div className="relative aspect-square md:aspect-[4/3] rounded-lg overflow-hidden shadow-xl">
            <Image
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
              alt="Equipo de Two Six Brand"
              fill
              className="object-cover"
            />
          </div>
        </div>
      </section>
    </>
  );
}