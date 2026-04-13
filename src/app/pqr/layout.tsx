import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'PQR | Radicar Petición, Queja o Reclamo',
  description: 'Radica tus solicitudes, sugerencias o reclamos de forma oficial. En Two Six nos comprometemos a darte respuesta conforme a la ley.',
  alternates: {
    canonical: '/pqr',
  },
};

export default function PqrLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
