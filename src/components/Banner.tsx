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
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />

      {/* Contenedor del texto, centrado y con padding consistente */}
      <div className="container mx-auto px-8 relative h-full flex flex-col justify-center items-center text-center text-white">
        <h1 className="text-4xl md:text-6xl font-serif font-bold tracking-wide drop-shadow-lg animate-in fade-in slide-in-from-bottom-4 duration-1000">{title}</h1>
        {subtitle && <p className="mt-4 text-lg md:text-xl font-light tracking-wider drop-shadow-md animate-in fade-in slide-in-from-bottom-4 duration-1000 delay-150 fill-mode-backwards">{subtitle}</p>}
      </div>
    </div>
  );
};

export default Banner;