"use client";

import { useState, useEffect } from "react";
import Image from "next/image";
import { TrackingTimeline } from "@/components/TrackingTimeline";

interface TrackingHistory {
    status: string;
    location: string;
    update_date: string;
}

interface Shipment {
    id: number;
    guide_number: string;
    status: string;
    createdAt: string;
    delivery_date?: string;
    shippingProvider?: {
        name: string;
    };
    trackingHistory?: TrackingHistory[];
}

interface OrderItem {
    id: number;
    product_name: string;
    color: string;
    size: string;
    quantity: number;
    unit_price: number;
    product: {
        clothingSize: {
            clothingColor: {
                imageClothing?: { image_url: string }[];
            }
        };
    };
}

interface Payment {
    transaction_date: string;
    status: string;
}

interface Order {
    id: number;
    order_reference: string;
    order_date: string;
    status: string;
    delivery_method?: string;
    pickup_status?: string;
    pickup_pin?: string;
    total_payment: number;
    shipping_cost?: number;
    payment_method?: string;
    cod_amount?: number;
    shipments?: Shipment[];
    orderItems: OrderItem[];
    payments?: Payment[];
}

import { useSearchParams } from "next/navigation";
import { Suspense } from "react";

function TrackingContent() {
    const searchParams = useSearchParams();
    const initialRef = searchParams?.get("ref") || "";
    const initialEmail = searchParams?.get("email") || "";

    const [orderReference, setOrderReference] = useState(initialRef);
    const [email, setEmail] = useState(initialEmail);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [order, setOrder] = useState<Order | null>(null);
    const [autoFetched, setAutoFetched] = useState(false);

    // Auto-fetch if both params are present on load
    useEffect(() => {
        if (initialRef && initialEmail && !autoFetched) {
            setAutoFetched(true);
            fetchOrderData(initialRef, initialEmail);
        }
    }, [initialRef, initialEmail, autoFetched]);

    const fetchOrderData = async (ref: string, userEmail: string) => {
        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderReference: ref, email: userEmail }),
            });

            if (!res.ok) {
                const data = await res.json();
                throw new Error(data.message || "No se pudo encontrar la orden");
            }

            const data = await res.json();
            setOrder(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError("Ocurrió un error desconocido");
            }
        } finally {
            setLoading(false);
        }
    };

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        await fetchOrderData(orderReference, email);
    };

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold text-center mb-8">Rastrea tu Pedido</h1>

            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <div className="space-y-4">
                    <form onSubmit={handleTrack} className="space-y-4">
                        <div>
                            <label htmlFor="orderReference" className="block text-sm font-medium text-gray-700 mb-1">
                                Referencia del Pedido
                            </label>
                            <input
                                type="text"
                                id="orderReference"
                                value={orderReference}
                                onChange={(e) => setOrderReference(e.target.value.toUpperCase())}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent uppercase"
                                placeholder="Ej: TS-260310-4821"
                                required
                            />
                        </div>

                        <div>
                            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
                                Correo Electrónico
                            </label>
                            <input
                                type="email"
                                id="email"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent"
                                placeholder="tu@email.com"
                                required
                            />
                        </div>

                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-300 disabled:opacity-50"
                        >
                            {loading ? "Buscando..." : "Rastrear"}
                        </button>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-md text-sm text-center">
                                {error}
                            </div>
                        )}
                    </form>
                </div>
            </div>

            {order && (
                <div className="bg-white p-8 rounded-lg shadow-md animate-fade-in">
                    <div className="border-b pb-4 mb-8 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Orden {order.order_reference || `#${order.id}`}</h2>
                            <p className="text-sm text-gray-500">
                                Fecha: {new Date(order.order_date).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    <TrackingTimeline order={order} />

                    <div className="mb-6 mt-8">
                        {order.delivery_method === 'PICKUP' ? (
                            <>
                                <h3 className="font-semibold mb-2">Información de Recogida</h3>
                                <div className="bg-blue-50 border border-blue-100 p-4 rounded-md mb-2">
                                    <p className="font-medium text-blue-900 mb-1">Punto de Retiro Two Six</p>
                                    <p className="text-blue-800 text-sm mb-2">CL 36D SUR #27D-39, APTO 1001<br/>URB Guadalcanal Apartamentos<br/>Envigado, Antioquia</p>
                                    <p className="text-sm flex items-center gap-2">
                                        <span className="font-medium">Estado actual:</span>
                                        {order.pickup_status === 'READY' ? (
                                            <span className="px-2 py-1 bg-green-100 text-green-700 rounded-md font-medium text-xs">🟢 Listo para Recoger</span>
                                        ) : order.pickup_status === 'COLLECTED' ? (
                                            <span className="px-2 py-1 bg-gray-200 text-gray-700 rounded-md font-medium text-xs">🔵 Entregado en Tienda</span>
                                        ) : (
                                            <span className="px-2 py-1 bg-amber-100 text-amber-700 rounded-md font-medium text-xs">🟡 En preparación</span>
                                        )}
                                    </p>
                                    {order.pickup_pin && (
                                        <div className="mt-3 bg-amber-50 border border-amber-200 p-3 rounded-md text-center">
                                            <p className="text-sm font-medium text-amber-800 mb-1">🔐 Tu PIN de Retiro</p>
                                            <p className="text-2xl font-bold tracking-[0.3em] font-mono text-black">{order.pickup_pin}</p>
                                            <p className="text-xs text-amber-700 mt-1">Presenta este código al recoger tu pedido</p>
                                        </div>
                                    )}
                                </div>
                            </>
                        ) : (
                            <>
                                <h3 className="font-semibold mb-2">Detalles del Envío</h3>
                                {order.shipments && order.shipments.length > 0 ? (
                                    order.shipments.map((shipment) => (
                                        <div key={shipment.id} className="bg-gray-50 p-4 rounded-md mb-2">
                                            <p><span className="font-medium">Transportadora:</span> {shipment.shippingProvider?.name || 'N/A'}</p>
                                            <p><span className="font-medium">Guía:</span> {shipment.guide_number}</p>
                                            <p><span className="font-medium">Estado:</span> {shipment.status}</p>
                                            {shipment.trackingHistory && shipment.trackingHistory.length > 0 && (
                                                <div className="mt-2 text-sm text-gray-600">
                                                    <p className="font-medium">Última actualización:</p>
                                                    <p>{shipment.trackingHistory[0].status} - {shipment.trackingHistory[0].location}</p>
                                                </div>
                                            )}
                                        </div>
                                    ))
                                ) : (
                                    <p className="text-gray-500 italic">Aún no hay información de envío disponible.</p>
                                )}
                            </>
                        )}
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Productos</h3>
                        <div className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                                    <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        {item.product.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ? (
                                            <Image
                                                src={item.product.clothingSize.clothingColor.imageClothing[0].image_url}
                                                alt={item.product_name}
                                                fill
                                                className="object-cover"
                                            />
                                        ) : (
                                            <div className="w-full h-full flex items-center justify-center text-gray-400 text-xs">
                                                No img
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="font-medium">{item.product_name}</p>
                                        <p className="text-sm text-gray-500">
                                            {item.color} / {item.size} x {item.quantity}
                                        </p>
                                    </div>
                                    <p className="font-medium">
                                        ${item.unit_price.toLocaleString()}
                                    </p>
                                </div>
                            ))}
                        </div>
                    </div>

                    <div className="mt-6 pt-4 border-t space-y-3">
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Subtotal de productos</span>
                            <span>${(order.total_payment - (order.shipping_cost || 0)).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center text-sm text-gray-600">
                            <span>Costo de envío</span>
                            <span>${(order.shipping_cost || 0).toLocaleString()}</span>
                        </div>
                        <div className="flex justify-between items-center font-bold text-lg pt-3 border-t">
                            <span>Total General</span>
                            <span>${order.total_payment.toLocaleString()}</span>
                        </div>
                        {(order.payment_method === 'WOMPI_COD' || order.status === 'Aprobado PCE') && (
                            <div className="flex justify-between items-center font-bold text-lg text-amber-600 pt-3 border-t">
                                <span>A Pagar Contra Entrega (PCE)</span>
                                <span>${(order.cod_amount || (order.total_payment - (order.shipping_cost || 0))).toLocaleString()}</span>
                            </div>
                        )}
                    </div>
                </div>
            )}
        </div>
    );
}

export default function TrackingPage() {
    return (
        <Suspense fallback={<div className="container mx-auto px-4 py-12 max-w-2xl text-center">Cargando...</div>}>
            <TrackingContent />
        </Suspense>
    );
}
