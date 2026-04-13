import React from "react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Política de Cookies | Two Six',
  description: 'Información sobre el uso de cookies en el sitio web de Two Six para mejorar tu experiencia de navegación.',
  alternates: {
    canonical: '/politicas/cookies',
  },
};

export default function CookiesPolicyPage() {
    return (
        <div className="min-h-screen bg-secondary/20 pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white p-8 md:p-12 lg:p-16 rounded-3xl shadow-sm border border-border">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 tracking-tight">Política de Cookies</h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">Última actualización: Marzo 2026</p>
                    </div>

                    <div className="prose prose-lg max-w-none text-primary/80 prose-headings:font-serif prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80">
                        <p>
                            En <strong>Two Six</strong> solemos utilizar Cookies y tecnologías similares para mejorar la experiencia de nuestros usuarios, personalizar el contenido, analizar nuestro tráfico y comprender cómo los visitantes interactúan con nuestro sitio web. Al navegar por este portal, aceptas el uso de cookies según se describe en esta política.
                        </p>

                        <h3>1. ¿Qué son las Cookies?</h3>
                        <p>
                            Las cookies son pequeños archivos de texto que los sitios web que visitas envían a tu navegador y que se almacenan en tu dispositivo (ordenador, tablet o teléfono móvil). Sirven para que el sitio recuerde información sobre tu visita, como tu idioma preferido, los productos en tu carrito de compras y otras opciones, lo que facilita y optimiza tu próxima visita.
                        </p>

                        <h3>2. Tipos de Cookies que utilizamos</h3>
                        <ul>
                            <li><strong>Cookies Estrictamente Necesarias:</strong> Estas cookies son esenciales para que puedas navegar por el sitio web y utilizar sus funciones, como acceder a áreas seguras o mantener artículos en el carrito de compras. Sin ellas, no podemos ofrecerte los servicios solicitados.</li>
                            <li><strong>Cookies de Rendimiento y Análisis:</strong> Nos permiten reconocer y contar el número de visitantes, así como entender cómo se mueven por el sitio web. Esto nos ayuda a mejorar el funcionamiento del sitio, por ejemplo, asegurando que los usuarios encuentren fácilmente lo que buscan. Utilizamos herramientas como Google Analytics para este propósito.</li>
                            <li><strong>Cookies de Funcionalidad:</strong> Se utilizan para reconocerte cuando vuelves a nuestro sitio web. Esto nos ayuda a personalizar nuestro contenido para ti y recordar tus preferencias.</li>
                            <li><strong>Cookies de Publicidad y Marketing:</strong> Estas cookies registran tu visita a nuestro sitio web, las páginas que has visitado y los enlaces que has seguido. Utilizaremos esta información para que nuestro sitio web y la publicidad que se muestra en él sean más relevantes para tus intereses.</li>
                        </ul>

                        <h3>3. Cómo gestionar las Cookies</h3>
                        <p>
                            Puedes configurar tu navegador para rechazar todas las cookies o para que te avise cuando se envíe una cookie. Sin embargo, si no aceptas las cookies, es posible que no puedas utilizar algunas partes de nuestro sitio web o que tu experiencia sea menos óptima y fluida.
                        </p>
                        <p>
                            Para más información sobre cómo modificar la configuración de las cookies en tu navegador, por favor consulta el menú de &quot;Ayuda&quot; del navegador que utilizas.
                        </p>

                        <h3>4. Actualizaciones a esta Política</h3>
                        <p>
                            Two Six se reserva el derecho de modificar esta Política de Cookies en cualquier momento. Las modificaciones entrarán en vigor tan pronto como se publiquen en nuestro sitio web. Te recomendamos revisar esta página periódicamente para estar al tanto de cualquier actualización.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
