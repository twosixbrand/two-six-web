import React from "react";
import Link from "next/link";

export default function TermsAndConditionsPage() {
    return (
        <div className="min-h-screen bg-secondary/20 pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-4xl">
                <div className="bg-white p-8 md:p-12 lg:p-16 rounded-3xl shadow-sm border border-border">
                    <div className="text-center mb-12">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 tracking-tight">Términos y Condiciones</h1>
                        <p className="text-sm text-muted-foreground uppercase tracking-widest">Última actualización: Marzo 2026</p>
                    </div>

                    <div className="prose prose-lg max-w-none text-primary/80 prose-headings:font-serif prose-headings:text-primary prose-a:text-accent hover:prose-a:text-accent/80">
                        <p>
                            Bienvenido al sitio web de <strong>Two Six</strong>. Al acceder y comprar en nuestra plataforma <Link href="https://twosixweb.com" className="text-primary font-semibold hover:text-accent underline transition-colors" target="_blank">https://twosixweb.com</Link>, asumes el compromiso de respetar estos Términos y Condiciones. Te rogamos leerlos atentamente antes de usar nuestros servicios.
                        </p>

                        <h3>1. Identificación del Vendedor</h3>
                        <ul>
                            <li><strong>Razón Social:</strong> Two Six S.A.S.</li>
                            <li><strong>NIT:</strong> 902000697</li>
                            <li><strong>Dirección:</strong> Cl 36 D Sur 27 D 39 AP 1001, Envigado, Antioquia, Colombia.</li>
                            <li><strong>Correo electrónico:</strong> twosixmarca@gmail.com</li>
                            <li><strong>Teléfono / WhatsApp:</strong> +57 310 877 7629</li>
                        </ul>

                        <h3>2. Aceptación</h3>
                        <p>
                            El uso de la página implica la lectura, entendimiento y aceptación incondicional de los presentes Términos y Condiciones, así como de nuestras Políticas de Privacidad. Si no estás de acuerdo con alguno de los términos o políticas indicadas, deberás dejar de usar inmediatamente la página.
                        </p>

                        <h3>3. Productos, Precios e Impuestos</h3>
                        <p>
                            Two Six pone a disposición del público productos, principalmente prendas de vestir, las cuales están debidamente fotografiadas y detalladas en cuanto a composición, colores y tallas. Nos esforzamos para que los colores se visualicen lo más precisos posibles, sin embargo, el color real que ves dependerá de tu monitor.
                        </p>
                        <p>
                            Todos los precios de los productos indicados en nuestra tienda incluyen IVA (Impuesto al Valor Agregado) cuando aplica y están expresados en pesos colombianos (COP), cumpliendo plenamente con la normativa comercial vigente en Colombia. Los gastos de envío se detallarán y añadirán al total durante el proceso de pago.
                        </p>

                        <h3>4. Proceso de Compra y Medios de Pago</h3>
                        <p>
                            La compra se considera perfeccionada desde el momento en que confirmemos el éxito del pago realizado. A través de este sitio te ofrecemos la posibilidad de realizar tus pagos utilizando gateways seguros (como Wompi by Bancolombia), con diversos medios como PSE, tarjetas de crédito y transferencias directas. No conservamos datos bancarios de ningún cliente.
                        </p>

                        <h3>5. Propiedad Intelectual</h3>
                        <p>
                            Todo el contenido publicado en la página, especialmente los diseños, textos, gráficos, logos, íconos, imágenes, clips de audio y video, descargas digitales, son propiedad exclusiva de <strong>Two Six S.A.S.</strong> y están protegidos por las leyes de derecho de autor y propiedad industrial existentes en Colombia y los tratados internacionales. Ningún elemento puede ser reproducido sin nuestra autorización.
                        </p>

                        <h3>6. Otras Políticas Relacionadas</h3>
                        <p>
                            Tus derechos como consumidor y nuestras obligaciones están detallados y complementados en los siguientes cuerpos normativos de la tienda:
                        </p>
                        <ul>
                            <li><Link href="/politicas/cambios-y-retracto">Política de Cambios, Garantías y Retracto</Link></li>
                            <li><Link href="/politicas/envios-y-entregas">Política de Compras y Entregas</Link></li>
                            <li><Link href="/politicas/privacidad">Política de Tratamiento de la Información</Link></li>
                        </ul>

                        <h3>7. Ley Aplicable</h3>
                        <p>
                            Estos Términos y Condiciones se regirán e interpretarán de acuerdo con las leyes de la República de Colombia. Cualquier controversia será resuelta ante los jueces de la República de Colombia o ante la <a href="https://www.sic.gov.co" target="_blank" rel="noopener noreferrer">Superintendencia de Industria y Comercio (SIC)</a> en sus facultades jurisdiccionales.
                        </p>
                    </div>
                </div>
            </div>
        </div>
    );
}
