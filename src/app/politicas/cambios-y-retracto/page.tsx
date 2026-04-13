import React from "react";
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Cambios y Retracto | Two Six',
  description: 'Consulta nuestras políticas de cambios, garantías y derecho al retracto. Queremos que tu experiencia con Two Six sea excepcional.',
  alternates: {
    canonical: '/politicas/cambios-y-retracto',
  },
};

export default function ReversionRetractPolicyPage() {
    return (
        <div className="min-h-screen bg-secondary/20 pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white p-8 md:p-12 lg:p-16 rounded-3xl shadow-sm border border-border">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 tracking-tight">Política de Cambios, Garantías y Retracto</h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">Última actualización: Marzo 2026</p>
                    </div>

                    <div className="prose prose-lg max-w-none text-primary/80 prose-headings:font-serif prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80">
                        <p>
                            En <strong>Two Six</strong>, nos esforzamos por ofrecer productos de la más alta calidad y un servicio excepcional. Sin embargo, entendemos que pueden surgir situaciones donde necesites realizar un cambio, solicitar una garantía o ejercer tu derecho al retracto, de acuerdo con el Estatuto del Consumidor en Colombia (Ley 1480 de 2011).
                        </p>

                        <h3>1. Derecho de Retracto</h3>
                        <p>
                            De conformidad con el artículo 47 de la Ley 1480 de 2011, tienes derecho a retractarte de tu compra dentro de los <strong>cinco (5) días hábiles</strong> contados a partir de la entrega del producto.
                        </p>
                        <ul>
                            <li>El producto debe ser devuelto en las mismas condiciones en que lo recibiste: sin uso, con todas sus etiquetas originales, accesorios y empaques en perfecto estado.</li>
                            <li>Los costos de transporte y los demás que conlleve la devolución del producto serán cubiertos por el consumidor.</li>
                            <li>Two Six reintegrará el dinero al consumidor dentro de los treinta (30) días calendario siguientes a la fecha en que se ejerció el derecho.</li>
                            <li>Por razones de higiene, <strong>no aceptamos retracto en prendas íntimas o bodies.</strong></li>
                        </ul>

                        <h3>2. Reversión del Pago</h3>
                        <p>
                            Según el Decreto 587 de 2016, podrás solicitar la reversión del pago cuando la compra haya sido mediante un mecanismo de comercio electrónico y se presente alguna de las siguientes causales:
                        </p>
                        <ul>
                            <li>Has sido objeto de fraude.</li>
                            <li>La transacción corresponda a una operación no solicitada.</li>
                            <li>El producto adquirido no haya sido recibido en el tiempo establecido.</li>
                            <li>El producto entregado no corresponda a lo solicitado, o sea defectuoso.</li>
                        </ul>
                        <p>
                            Para ejercer este derecho, deberás presentar tu queja dentro de los <strong>cinco (5) días hábiles</strong> siguientes a la fecha en que tuviste noticia de la situación que motiva la reversión, notificando inmediatamente tanto a Two Six como al emisor del instrumento de pago electrónico utilizado.
                        </p>

                        <h3>3. Política de Cambios</h3>
                        <p>
                            Ofrecemos la posibilidad de cambiar tu prenda por talla o color dentro de los <strong>treinta (30) días calendario</strong> posteriores a la compra. El producto debe estar nuevo, sin uso y con sus etiquetas y empaques originales.
                        </p>
                        <p>
                            El costo del envío para la devolución hacia nuestras instalaciones corre por cuenta del cliente, y nosotros asumimos el envío de la nueva prenda de cambio.
                        </p>

                        <h3>4. Política de Garantías</h3>
                        <p>
                            Si el producto presenta defectos de calidad o fabricación, tienes un plazo de <strong>noventa (90) días calendario</strong> a partir de la fecha de entrega para solicitar la garantía.
                        </p>
                        <ul>
                            <li>La vida útil de nuestras prendas depende de su cuidado. La garantía no cubre daños ocasionados por mal uso, desgaste natural por uso normal, no seguimiento de las instrucciones de lavado o someter la prenda a alteraciones.</li>
                            <li>Revisaremos la prenda y te daremos respuesta en un plazo máximo de quince (15) días hábiles.</li>
                            <li>De ser aprobada la garantía, repararemos la prenda. Si no es posible repararla, se repondrá por una nueva o se devolverá el dinero.</li>
                        </ul>

                        <h3>5. ¿Cómo presentar una solicitud?</h3>
                        <p>
                            Si deseas ejercer alguno de estos derechos, puedes radicar tu solicitud contactándonos a través de nuestro botón de <strong>PQR</strong>, por medio del correo electrónico, o escribiendo directamente a nuestra línea de WhatsApp de servicio al cliente indicando el número de tu pedido, tus datos y detallando tu solicitud.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
