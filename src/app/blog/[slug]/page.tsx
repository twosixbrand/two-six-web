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
