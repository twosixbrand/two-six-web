import React from "react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Envíos y Entregas | Two Six',
  description: 'Consulta nuestros tiempos de entrega, costos de envío y procesos de despacho para tus pedidos de Two Six en Colombia.',
  alternates: {
    canonical: '/politicas/envios-y-entregas',
  },
};

export default function ShippingDeliveryPolicyPage() {
    return (
        <div className="min-h-screen bg-secondary/20 pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white p-8 md:p-12 lg:p-16 rounded-3xl shadow-sm border border-border">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 tracking-tight">Política de Compras y Entregas</h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">Última actualización: Marzo 2026</p>
                    </div>

                    <div className="prose prose-lg max-w-none text-primary/80 prose-headings:font-serif prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80">
                        <p>
                            Gracias por elegir <strong>Two Six</strong>. Esta política describe qué puedes esperar en relación al proceso de compra, tiempos de preparación, envíos y entregas a lo largo del territorio nacional en Colombia.
                        </p>

                        <h3>1. Procesamiento de Pedidos</h3>
                        <p>
                            Todos los pedidos están sujetos a la disponibilidad de los productos. Si hubiera algún problema para procesarlos o si de manera excepcional las referencias solicitadas se llegarán a agotar o no se encontrarán en condiciones para su despacho, te informaremos a la mayor brevedad posible para realizarte la respectiva devolución del dinero por el valor pagado o para que escojas otro producto de igual o mayor valor pagando el excedente.
                        </p>

                        <h3>2. Tiempos de Entrega</h3>
                        <p>
                            Nuestro compromiso es entregar tus pedidos en el menor tiempo posible. Sin embargo, los tiempos de entrega varían dependiendo de la ubicación de entrega:
                        </p>
                        <ul>
                            <li><strong>Medellín y Área Metropolitana:</strong> 1 a 3 días hábiles.</li>
                            <li><strong>Ciudades Principales:</strong> 2 a 5 días hábiles.</li>
                            <li><strong>Resto del País:</strong> 5 a 8 días hábiles según la cobertura de la transportadora.</li>
                        </ul>
                        <p>
                            <em>Los tiempos empiezan a contar a partir del día hábil siguiente a la confirmación del pago. Ten presente que durante temporadas de alta demanda (Black Friday, Navidad, lanzamientos) los tiempos pueden extenderse.</em>
                        </p>

                        <h3>3. Costos de Envío</h3>
                        <p>
                            El costo del envío es calculado de manera dinámica en la página web dependiendo del lugar de recepción, la cantidad de prendas y en consecuencia, del peso de las mismas, o este se te sumará en la cuenta de cobro en caso de pagar contra-entrega o anticipado.
                        </p>
                        <p>
                            <strong>Two Six</strong> podrá ofertar promociones que incluyan envíos gratuitos las cuales serán debidamente anunciadas con sus respectivas condiciones y vigencias en nuestro portal.
                        </p>

                        <h3>4. Seguimiento y Novedades</h3>
                        <p>
                            Una vez despachado el pedido, recibirás por medio del correo electrónico, mensaje de texto o vía WhatsApp el número de guía para que puedas rastrear tu paquete en todo momento con la empresa transportadora asignada. Si experimentas un retraso inusual o una novedad con tu paquete, por favor comunícate a nuestras líneas de atención a través de llamada o WhatsApp al <strong>310 8777629</strong>, o escribiéndonos a nuestro correo <strong>twosixmarca@gmail.com</strong>.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
