import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contacto | Two Six',
  description: '¿Tienes alguna duda o quieres saber más sobre tu pedido? Ponte en contacto con el equipo de Two Six. Estamos para ayudarte.',
  alternates: {
    canonical: '/contact',
  },
};

export default function ContactLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
