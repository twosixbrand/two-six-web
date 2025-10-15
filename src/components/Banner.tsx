import Image from 'next/image';

interface BannerProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
}

const Banner = ({ imageUrl, title, subtitle }: BannerProps) => {
  return (
    // Contenedor relativo para posicionar el texto sobre la imagen
    <div className="relative w-full h-64 md:h-80 rounded-lg overflow-hidden mb-8">
      {/* Imagen de fondo con el componente Image de Next.js para optimización */}
      <Image
        src={imageUrl}
        alt={title}
        fill
        className="object-cover"
        priority // Carga la imagen con prioridad, bueno para elementos "hero"
      />
      {/* Capa oscura para mejorar la legibilidad del texto */}
      <div className="absolute inset-0 bg-black bg-opacity-40" />

      {/* Contenedor del texto, centrado vertical y horizontalmente */}
      <div className="relative h-full flex flex-col justify-center items-center text-center text-white p-4">
        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-md">{title}</h1>
        {subtitle && <p className="mt-2 text-lg md:text-xl drop-shadow-md">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Banner;