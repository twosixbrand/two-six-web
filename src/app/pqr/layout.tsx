import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PQR - Peticiones, Quejas y Reclamos',
  description: 'Radica tus peticiones, quejas o reclamos en Two Six. Te responderemos en el menor tiempo posible.',
  alternates: { canonical: '/pqr' },
  openGraph: {
    title: 'PQR | Two Six',
    description: 'Radica tus peticiones, quejas o reclamos.',
    url: '/pqr',
  },
};

export default function PqrLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
