import Link from 'next/link';
import Image from 'next/image';
import { getAllPosts } from '@/lib/blog';
import Breadcrumbs from '@/components/Breadcrumbs';

export const metadata = {
  title: 'Blog de Moda Urbana | Two Six Journal',
  description: 'Descubre guías, tendencias y la cultura del streetwear en Medellín. Conoce cómo cuidar tus prendas y todo sobre el mundo Two Six.',
  alternates: {
    canonical: '/blog',
  },
};

export default async function BlogIndexPage() {
  const posts = await getAllPosts();

  const breadcrumbs = [
    { label: 'Inicio', href: '/' },
    { label: 'Blog', href: '/blog' },
  ];

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-6">
        <Breadcrumbs items={breadcrumbs} />
      </div>
      
      <div className="text-center mb-12">
        <h1 className="text-4xl md:text-5xl font-serif font-bold text-gray-900 mb-4 tracking-tight">Two Six Journal (Blog)</h1>
        <p className="text-lg text-gray-600 max-w-2xl mx-auto">
          Cultura, tendencias y guías sobre moda urbana directamente desde Medellín.
        </p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8">
        {posts.map((post) => (
          <article key={post.slug} className="bg-white rounded-2xl overflow-hidden shadow-sm hover:shadow-md transition-shadow border border-neutral-100 flex flex-col h-full group">
            <Link href={`/blog/${post.slug}`} className="block relative aspect-video w-full overflow-hidden">
              <Image
                src={post.coverImage || '/placeholder.png'}
                alt={post.title}
                fill
                className="object-cover group-hover:scale-105 transition-transform duration-500"
              />
            </Link>
            <div className="p-6 flex flex-col flex-grow">
              <div className="flex gap-2 mb-3 flex-wrap">
                {post.tags.slice(0, 2).map(tag => (
                  <span key={tag} className="text-xs font-medium bg-neutral-100 text-neutral-600 px-2.5 py-1 rounded-full uppercase tracking-wider">
                    {tag}
                  </span>
                ))}
              </div>
              <Link href={`/blog/${post.slug}`} className="block group-hover:text-primary transition-colors">
                <h2 className="text-xl font-bold text-gray-900 mb-3 leading-tight font-serif">{post.title}</h2>
              </Link>
              <p className="text-gray-600 mb-4 text-sm flex-grow line-clamp-3 leading-relaxed">
                {post.excerpt}
              </p>
              <div className="mt-auto pt-4 border-t border-neutral-100 flex items-center justify-between text-sm">
                <span className="text-neutral-500 font-medium">
                  {new Date(post.date).toLocaleDateString('es-CO', { year: 'numeric', month: 'long', day: 'numeric' })}
                </span>
                <Link href={`/blog/${post.slug}`} className="text-primary font-bold hover:underline">
                  Leer más →
                </Link>
              </div>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}
