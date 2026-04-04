import { getPostBySlug, getPostSlugs } from '@/lib/blog';
import { notFound } from 'next/navigation';
import Image from 'next/image';
import Breadcrumbs from '@/components/Breadcrumbs';
import Link from 'next/link';

export async function generateStaticParams() {
  const slugs = getPostSlugs();
  return slugs.map((slug) => ({
    slug: slug.replace(/\.md$/, ''),
  }));
}

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  try {
    const post = await getPostBySlug(slug);
    return {
      title: `${post.title} | Two Six Journal`,
      description: post.excerpt,
      openGraph: {
        title: post.title,
        description: post.excerpt,
        images: [post.coverImage],
        type: 'article',
        publishedTime: post.date,
        authors: ['Two Six'],
      },
    };
  } catch (e) {
    return { title: 'Post no encontrado' };
  }
}

export default async function BlogPost({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  
  let post;
  try {
    post = await getPostBySlug(slug);
  } catch (e) {
    return notFound();
  }

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
    { label: post.title, href: `/blog/${slug}` },
  ];

  return (
    <div className="container mx-auto px-4 py-8 max-w-4xl">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      
      <article className="bg-white rounded-2xl overflow-hidden shadow-sm border border-neutral-100">
        <div className="relative aspect-video w-full">
          <Image
            src={post.coverImage || '/placeholder.png'}
            alt={post.title}
            fill
            className="object-cover"
            priority
          />
        </div>
        
        <div className="p-6 md:p-12">
          <div className="flex gap-2 mb-6 flex-wrap">
            {post.tags.map(tag => (
              <span key={tag} className="text-xs font-medium bg-neutral-100 text-neutral-600 px-3 py-1 rounded-full uppercase tracking-wider">
                {tag}
              </span>
            ))}
          </div>

          <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-6 leading-tight">
            {post.title}
          </h1>

          <div className="flex items-center text-gray-500 mb-10 pb-8 border-b border-gray-100 text-sm">
            <span className="font-medium">Por Two Six</span>
            <span className="mx-3">•</span>
            <span>{new Date(post.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}</span>
          </div>

          <div 
            className="prose prose-lg md:prose-xl max-w-none text-gray-700 
                       prose-headings:font-serif prose-headings:text-gray-900 
                       prose-a:text-primary prose-a:font-semibold hover:prose-a:text-primary/80
                       prose-img:rounded-xl prose-img:shadow-md"
            dangerouslySetInnerHTML={{ __html: post.contentHtml }} 
          />
          
          {/* Puente hacia Redes Sociales */}
          <div className="mt-12 pt-10 border-t border-neutral-100">
            <h3 className="text-2xl font-serif font-bold text-gray-900 mb-3">Únete a la conversación</h3>
            <p className="text-gray-600 mb-6 max-w-2xl">
              ¿Tienes alguna duda o quieres compartir tu opinión sobre este artículo? El debate continúa en nuestras redes sociales. La comunidad de los "Real Ones" te espera.
            </p>
            <a 
              href="https://instagram.com/twosix.brand" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center justify-center bg-black text-white px-6 py-3 rounded-lg font-bold hover:bg-neutral-800 transition-colors"
            >
              Comentar en Instagram
              <svg className="w-5 h-5 ml-2" fill="currentColor" viewBox="0 0 24 24" aria-hidden="true">
                <path fillRule="evenodd" d="M12.315 2c2.43 0 2.784.013 3.808.06 1.064.049 1.791.218 2.427.465a4.902 4.902 0 011.772 1.153 4.902 4.902 0 011.153 1.772c.247.636.416 1.363.465 2.427.048 1.067.06 1.407.06 4.123v.08c0 2.643-.012 2.987-.06 4.043-.049 1.064-.218 1.791-.465 2.427a4.902 4.902 0 01-1.153 1.772 4.902 4.902 0 01-1.772 1.153c-.636.247-1.363.416-2.427.465-1.067.048-1.407.06-4.123.06h-.08c-2.643 0-2.987-.012-4.043-.06-1.064-.049-1.791-.218-2.427-.465a4.902 4.902 0 01-1.772-1.153 4.902 4.902 0 01-1.153-1.772c-.247-.636-.416-1.363-.465-2.427-.047-1.024-.06-1.379-.06-3.808v-.63c0-2.43.013-2.784.06-3.808.049-1.064.218-1.791.465-2.427a4.902 4.902 0 011.153-1.772A4.902 4.902 0 015.45 2.525c.636-.247 1.363-.416 2.427-.465C8.901 2.013 9.256 2 11.685 2h.63zm-.081 1.802h-.468c-2.456 0-2.784.011-3.807.058-.975.045-1.504.207-1.857.344-.467.182-.8.398-1.15.748-.35.35-.566.683-.748 1.15-.137.353-.3.882-.344 1.857-.047 1.023-.058 1.351-.058 3.807v.468c0 2.456.011 2.784.058 3.807.045.975.207 1.504.344 1.857.182.466.399.8.748 1.15.35.35.683.566 1.15.748.353.137.882.3 1.857.344 1.054.048 1.37.058 4.041.058h.08c2.597 0 2.917-.01 3.96-.058.976-.045 1.505-.207 1.858-.344.466-.182.8-.398 1.15-.748.35-.35.566-.683.748-1.15.137-.353.3-.882.344-1.857.048-1.055.058-1.37.058-4.041v-.08c0-2.597-.01-2.917-.058-3.96-.045-.976-.207-1.505-.344-1.858a3.097 3.097 0 00-.748-1.15 3.098 3.098 0 00-1.15-.748c-.353-.137-.882-.3-1.857-.344-1.023-.047-1.351-.058-3.807-.058zM12 6.865a5.135 5.135 0 110 10.27 5.135 5.135 0 010-10.27zm0 1.802a3.333 3.333 0 100 6.666 3.333 3.333 0 000-6.666zm5.338-3.205a1.2 1.2 0 110 2.4 1.2 1.2 0 010-2.4z" clipRule="evenodd" />
              </svg>
            </a>
          </div>

        </div>
      </article>

      <div className="mt-12 mb-8 bg-neutral-50 rounded-2xl p-8 text-center border border-neutral-100">
        <h3 className="text-2xl font-serif font-bold text-gray-900 mb-4">¿Listo para elevar tu estilo?</h3>
        <p className="text-gray-600 mb-6 max-w-xl mx-auto">Nuestras colecciones están diseñadas para ofrecerte la calidad de un básico premium que mencionamos en este artículo.</p>
        <div className="flex flex-wrap justify-center gap-4">
          <Link href="/man" className="bg-primary text-white font-bold py-3 px-8 rounded-lg hover:bg-primary/90 transition-colors duration-300">
            Ver Colección Hombre
          </Link>
          <Link href="/woman" className="bg-white text-primary border border-primary font-bold py-3 px-8 rounded-lg hover:bg-neutral-50 transition-colors duration-300">
            Ver Colección Mujer
          </Link>
        </div>
      </div>
    </div>
  );
}
