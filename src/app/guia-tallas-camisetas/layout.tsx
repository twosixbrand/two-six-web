import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Guía de Tallas',
  description: 'Consulta la guía de tallas de Two Six para encontrar tu talla ideal en camisetas. Medidas exactas para que compres con confianza.',
  alternates: { canonical: '/guia-tallas-camisetas' },
  openGraph: {
    title: 'Guía de Tallas | Two Six',
    description: 'Encuentra tu talla ideal con nuestra guía de medidas.',
    url: '/guia-tallas-camisetas',
  },
};

export default function GuiaTallasLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
