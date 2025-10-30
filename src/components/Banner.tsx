import Image from 'next/image';

interface BannerProps {
  imageUrl: string;
  title: string;
  subtitle?: string;
}

const Banner = ({ imageUrl, title, subtitle }: BannerProps) => {
  return (
    // Contenedor relativo para posicionar el texto sobre la imagen
    <div className="relative w-full h-64 md:h-80 mb-8">
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

      {/* Contenedor del texto, centrado y con padding consistente */}
      <div className="container mx-auto px-8 relative h-full flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-5xl font-extrabold drop-shadow-md">{title}</h1>
        {subtitle && <p className="mt-2 text-lg md:text-xl drop-shadow-md">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Banner;