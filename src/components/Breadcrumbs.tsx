import Link from 'next/link';

interface Breadcrumb {
  label: string;
  href: string;
}

interface BreadcrumbsProps {
  items: Breadcrumb[];
}

export default function Breadcrumbs({ items }: BreadcrumbsProps) {
  return (
    <nav aria-label="Breadcrumb" className="text-sm text-primary/70">
      <ol className="flex items-center space-x-2">
        {items.map((item, index) => (
          <li key={index} className="flex items-center">
            {index > 0 && <span className="mx-2">/</span>}
            {index === items.length - 1 ? (
              <span className="font-semibold text-primary">{item.label}</span>
            ) : (
              <Link href={item.href} className="hover:text-accent transition-colors">{item.label}</Link>
            )}
          </li>
        ))}
      </ol>
    </nav>
  );
}