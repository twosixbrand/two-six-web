import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Contáctanos',
  description: 'Contáctanos en Two Six. Estamos para ayudarte con dudas sobre pedidos, tallas, envíos y más. Escríbenos desde Medellín, Colombia.',
  alternates: { canonical: '/contact' },
  openGraph: {
    title: 'Contáctanos | Two Six',
    description: 'Estamos para ayudarte. Escríbenos con cualquier duda.',
    url: '/contact',
  },
};

export default function ContactLayout({ children }: { children: React.ReactNode }) {
  return <>{children}</>;
}
