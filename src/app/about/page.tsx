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

      <div className="container mx-auto px-6 py-12">
        <div className="grid md:grid-cols-2 gap-12 items-center">
          <div>
            <h2 className="text-3xl font-bold text-primary mb-4">Nuestra Misión</h2>
            <p className="text-gray-700 leading-relaxed mb-4">
              En Two Six Brand, nuestra misión es ofrecer moda de alta calidad que no solo te haga lucir bien, sino también sentirte increíble. Creemos en la autoexpresión a través del estilo y nos dedicamos a crear prendas que combinan diseño contemporáneo, comodidad y durabilidad.
            </p>
            <p className="text-gray-700 leading-relaxed">
              Desde nuestros inicios, nos hemos comprometido con la sostenibilidad y la producción ética. Cada pieza es diseñada con atención al detalle, utilizando materiales seleccionados para minimizar nuestro impacto ambiental y asegurar que recibas un producto que amarás por años.
            </p>
          </div>
          <div className="rounded-lg overflow-hidden shadow-lg">
            <Image
              src="https://images.unsplash.com/photo-1556905055-8f358a7a47b2?w=800&q=80"
              alt="Equipo de Two Six Brand"
              width={800}
              height={600}
              className="w-full h-full object-cover"
            />
          </div>
        </div>
      </div>
    </>
  );
}