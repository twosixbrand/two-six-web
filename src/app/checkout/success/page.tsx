"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import Image from "next/image";
import { useEffect, useState, Suspense } from "react";
import { useCart } from "@/context/CartContext";

interface OrderItem {
    id: number;
    product_name: string;
    quantity: number;
    unit_price: number;
    size: string;
    color: string;
    product: {
        image_url?: string;
        clothingSize?: {
            clothingColor?: {
                image_url?: string;
                imageClothing?: Array<{ image_url: string }>;
            }
        };
    };
}

interface Order {
    id: number;
    order_reference?: string;
    total_payment: number;
    shipping_cost: number;
    payment_method?: string;
    cod_amount?: number;
    shipping_address: string;
    delivery_method?: string;
    pickup_pin?: string;
    customer: {
        name: string;
        email: string;
        current_phone_number: string;
    };
    orderItems: OrderItem[];
}

function SuccessContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const orderId = searchParams?.get("orderId");
    const transactionId = searchParams?.get("id") || searchParams?.get("transactionId");

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verificando información...');
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        const fetchOrder = async (id: string) => {
            try {
                const isReference = id.startsWith('TS-');
                const endpoint = isReference
                    ? `${process.env.NEXT_PUBLIC_API_URL}/api/order/by-reference/${id}`
                    : `${process.env.NEXT_PUBLIC_API_URL}/api/order/${id}`;

                const response = await fetch(endpoint);
                if (!response.ok) throw new Error('Error al obtener la orden');
                const data = await response.json();
                setOrder(data);
                setStatus('success');
                setMessage('¡Gracias por tu compra!');
                clearCart();
            } catch (error) {
                console.error(error);
                setStatus('error');
                setMessage('No pudimos cargar los detalles de tu orden, pero tu pago fue procesado.');
            }
        };

        if (transactionId) {
            // Siempre que haya transactionId, intentamos verificar primero
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'APPROVED') {
                        fetchOrder(orderId || data.orderId.toString());
                    } else {
                        setStatus('error');
                        setMessage(`El pago no fue aprobado. Estado: ${data.status}`);
                    }
                })
                .catch(() => {
                    setStatus('error');
                    setMessage('Error verificando el pago.');
                });
        } else if (orderId) {
            fetchOrder(orderId);
        } else {
            setStatus('error');
            setMessage('No se encontró información de la orden.');
        }
    }, [orderId, transactionId, clearCart]);

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-2xl w-full">
            {status === 'loading' && (
                <div className="text-center">
                    <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mx-auto mb-4"></div>
                    <p className="text-gray-600">Cargando detalles del pedido...</p>
                </div>
            )}

            {status === 'success' && order && (
                <div>
                    <div className="text-center mb-8">
                        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <svg className="w-8 h-8 text-green-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7" />
                            </svg>
                        </div>
                        <h1 className="text-3xl font-bold text-gray-800 mb-2">¡Gracias por tu compra!</h1>
                        <p className="text-gray-600">Tu pedido {order.order_reference || `#${order.id}`} ha sido confirmado.</p>
                        <div className="mt-5 inline-flex flex-col sm:flex-row items-center gap-2 bg-blue-50 text-blue-800 px-5 py-3 rounded-full text-sm font-medium border border-blue-100 shadow-sm animate-in fade-in slide-in-from-bottom-2 duration-700">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-blue-600" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                            </svg>
                            En los próximos minutos recibirás tu Factura Electrónica de la DIAN en tu correo.
                        </div>
                    </div>

                    <div className="border-t border-b py-4 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
                        <div className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0 bg-gray-100">
                                            <Image
                                                src={
                                                    item.product?.image_url ||
                                                    item.product?.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ||
                                                    item.product?.clothingSize?.clothingColor?.image_url ||
                                                    '/placeholder.png'
                                                }
                                                alt={item.product_name}
                                                fill
                                                className="object-cover"
                                                unoptimized={true}
                                                quality={100}
                                            />
                                        </div>
                                        <div className="flex-1">
                                            <p className="font-medium">{item.product_name}</p>
                                            <p className="text-sm text-gray-500">
                                                {item.size} / {item.color} x {item.quantity}
                                            </p>
                                        </div>
                                    </div>
                                    <p className="font-medium">{formatPrice(item.unit_price * item.quantity)}</p>
                                </div>
                            ))}
                        </div>

                        {(() => {
                            const subtotal = order.orderItems.reduce((sum, item) => sum + (item.unit_price * item.quantity), 0);
                            const shipping = order.shipping_cost || 0;
                            const discount = Math.round((subtotal + shipping) - order.total_payment);

                            return (
                                <div className="mt-6 pt-4 border-t border-gray-200 space-y-2">
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Subtotal</span>
                                        <span className={discount > 1 ? "line-through text-gray-400" : ""}>{formatPrice(subtotal)}</span>
                                    </div>
                                    {discount > 1 && (
                                        <div className="flex justify-between items-center text-green-600 font-medium">
                                            <span>Descuento aplicado</span>
                                            <span>-{formatPrice(discount)}</span>
                                        </div>
                                    )}
                                    <div className="flex justify-between items-center text-gray-600">
                                        <span>Costo de envío</span>
                                        <span>{formatPrice(shipping)}</span>
                                    </div>
                                </div>
                            );
                        })()}
                    </div>

                    {order.payment_method === 'WOMPI_COD' ? (
                        <>
                            <div className="flex justify-between items-center text-lg font-bold mb-2">
                                <span>Valor Pagado Hoy (Envío)</span>
                                <span>{formatPrice(order.shipping_cost || 0)}</span>
                            </div>
                            <div className="flex justify-between font-bold text-lg text-amber-700 mt-4 border-t pt-2">
                                <span>A Pagar Contra Entrega (PCE):</span>
                                <span>${(order.cod_amount || 0).toLocaleString()}</span>
                            </div>
                        </>
                    ) : (
                        <div className="flex justify-between items-center text-xl font-bold mb-8">
                            <span>Total Pagado</span>
                            <span>{formatPrice(order.total_payment)}</span>
                        </div>
                    )}

                    {order.delivery_method === 'PICKUP' ? (
                        <div className="bg-neutral-50 p-6 rounded-2xl mb-8 border border-neutral-200 shadow-sm relative overflow-hidden">
                            <div className="absolute top-0 left-0 w-1.5 h-full bg-primary/80"></div>
                            <div className="flex items-start gap-4">
                                <div className="bg-white p-2.5 rounded-xl shadow-sm border border-neutral-100 mt-1 shrink-0">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" />
                                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" />
                                    </svg>
                                </div>
                                <div className="w-full">
                                    <h3 className="font-bold text-gray-900 mb-1 text-lg tracking-tight">Punto de Retiro Seleccionado</h3>
                                    <p className="text-gray-800 font-medium mb-3">{order.customer.name}</p>
                                    
                                    <div className="bg-white p-3 rounded-lg border border-neutral-100 mb-4">
                                        <p className="text-gray-600 leading-relaxed font-medium">
                                            CL 36D SUR #27D-39, APTO 1001<br/>
                                            URB Guadalcanal Apartamentos<br/>
                                            Envigado, Antioquia
                                        </p>
                                    </div>
                                    
                                    {order.pickup_pin && (
                                        <div className="bg-amber-50/80 border-l-4 border-amber-500 p-4 rounded-r-lg mb-4">
                                            <p className="text-sm text-amber-800 font-semibold uppercase tracking-wider mb-1">PIN de Seguridad Obligatorio</p>
                                            <div className="flex items-center gap-3">
                                                <span className="text-3xl font-black text-gray-900 tracking-[0.2em]">{order.pickup_pin}</span>
                                            </div>
                                            <p className="text-xs text-amber-700/80 mt-1 font-medium">Deberás proveer este PIN cuando retires tu pedido.</p>
                                        </div>
                                    )}
                                    
                                    <div className="pt-3 border-t border-neutral-200/80 flex flex-col gap-2 text-sm text-gray-600">
                                        <p><strong>Teléfono Bodega:</strong> +57 310 877 7629</p>
                                        <div className="text-amber-800 bg-amber-50/80 px-3 py-2 rounded-lg inline-flex items-center gap-2 mt-1 font-medium border border-amber-200/60 shadow-sm w-fit">
                                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                                            </svg>
                                            Tu pedido estará listo 4 horas hábiles después del pago.
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ) : (
                        <div className="bg-gray-50 p-4 rounded-lg mb-8">
                            <h3 className="font-semibold mb-2">Datos de Envío</h3>
                            <p className="text-gray-600">{order.customer.name}</p>
                            <p className="text-gray-600">{order.shipping_address}</p>
                            <p className="text-gray-600">{order.customer.current_phone_number}</p>
                            <p className="text-gray-600">{order.customer.email}</p>
                        </div>
                    )}

                    <div className="text-center">
                        <a
                            href="/"
                            className="inline-block bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-hover transition-colors duration-300"
                        >
                            Volver a la Tienda
                        </a>
                    </div>
                </div>
            )}

            {status === 'error' && (
                <div className="text-center">
                    <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                        <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                        </svg>
                    </div>
                    <h1 className="text-2xl font-bold text-gray-800 mb-2">Algo salió mal</h1>
                    <p className="text-gray-600 mb-6">{message}</p>
                    <a
                        href="/"
                        className="inline-block bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-300"
                    >
                        Volver a la tienda
                    </a>
                </div>
            )}
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <Suspense fallback={<div>Cargando...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
