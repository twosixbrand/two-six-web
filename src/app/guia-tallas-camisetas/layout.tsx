import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía de Tallas | Camisetas Two Six',
  description: 'Encuentra tu talla ideal con nuestra guía de medidas detallada. Diseños premium con el ajuste perfecto para tu estilo.',
  alternates: {
    canonical: '/guia-tallas-camisetas',
  },
};

export default function SizeGuideLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
