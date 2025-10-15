import Link from 'next/link';

const Footer = () => {
  return (
    <footer className="bg-white mt-12">
      <div className="container mx-auto px-6 py-8">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="text-2xl font-bold text-primary hover:text-accent">
            two-six-web
          </Link>

          <div className="flex justify-center mt-4">
            <Link href="/man" className="mx-4 text-sm text-primary/80 hover:text-accent">Hombre</Link>
            <Link href="/woman" className="mx-4 text-sm text-primary/80 hover:text-accent">Mujer</Link>
            <Link href="/about" className="mx-4 text-sm text-primary/80 hover:text-accent">Nosotros</Link>
            <Link href="/contact" className="mx-4 text-sm text-primary/80 hover:text-accent">Contacto</Link>
          </div>
        </div>

        <hr className="my-6 border-gray-200" />

        <p className="text-center text-sm text-gray-500">
          © {new Date().getFullYear()} two-six-web. Todos los derechos reservados.
        </p>
      </div>
    </footer>
  );
};

export default Footer;