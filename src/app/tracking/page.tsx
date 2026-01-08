"use client";

import { useState } from "react";
import Image from "next/image";

interface TrackingHistory {
    status: string;
    location: string;
}

interface Shipment {
    id: number;
    guide_number: string;
    status: string;
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
                image_url?: string;
            }
        };
    };
}

interface Order {
    id: number;
    order_date: string;
    status: string;
    total_payment: number;
    shipments?: Shipment[];
    orderItems: OrderItem[];
}

export default function TrackingPage() {
    const [orderId, setOrderId] = useState("");
    const [email, setEmail] = useState("");
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState("");
    const [order, setOrder] = useState<Order | null>(null);

    const handleTrack = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError("");
        setOrder(null);

        try {
            const res = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/track`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ orderId: Number(orderId), email }),
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

    return (
        <div className="container mx-auto px-4 py-12 max-w-2xl">
            <h1 className="text-3xl font-bold text-center mb-8">Rastrea tu Pedido</h1>

            <div className="bg-white p-8 rounded-lg shadow-md mb-8">
                <form onSubmit={handleTrack} className="space-y-4">
                    <div>
                        <label htmlFor="orderId" className="block text-sm font-medium text-gray-700 mb-1">
                            Número de Orden
                        </label>
                        <input
                            type="number"
                            id="orderId"
                            value={orderId}
                            onChange={(e) => setOrderId(e.target.value)}
                            className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-accent focus:border-accent"
                            placeholder="Ej: 123"
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

            {order && (
                <div className="bg-white p-8 rounded-lg shadow-md animate-fade-in">
                    <div className="border-b pb-4 mb-4 flex justify-between items-center">
                        <div>
                            <h2 className="text-xl font-bold">Orden #{order.id}</h2>
                            <p className="text-sm text-gray-500">
                                Fecha: {new Date(order.order_date).toLocaleDateString()}
                            </p>
                        </div>
                        <span className={`px-3 py-1 rounded-full text-sm font-medium ${order.status === 'Pagado' ? 'bg-green-100 text-green-800' :
                            order.status === 'Enviado' ? 'bg-blue-100 text-blue-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {order.status}
                        </span>
                    </div>

                    <div className="mb-6">
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
                    </div>

                    <div>
                        <h3 className="font-semibold mb-2">Productos</h3>
                        <div className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex items-center gap-4 border-b pb-4 last:border-0">
                                    <div className="relative w-16 h-16 bg-gray-100 rounded-md overflow-hidden flex-shrink-0">
                                        {item.product.clothingSize?.clothingColor?.image_url ? (
                                            <Image
                                                src={item.product.clothingSize.clothingColor.image_url}
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

                    <div className="mt-6 pt-4 border-t flex justify-between items-center font-bold text-lg">
                        <span>Total</span>
                        <span>${order.total_payment.toLocaleString()}</span>
                    </div>
                </div>
            )}
        </div>
    );
}
