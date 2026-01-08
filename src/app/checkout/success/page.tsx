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
        clothingSize: {
            clothingColor: {
                image_url?: string;
            }
        };
    };
}

interface Order {
    id: number;
    total_payment: number;
    shipping_address: string;
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
    const orderId = searchParams.get("orderId");
    const transactionId = searchParams.get("id") || searchParams.get("transactionId");

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verificando información...');
    const [order, setOrder] = useState<Order | null>(null);

    useEffect(() => {
        const fetchOrder = async (id: string) => {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/${id}`);
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

        if (orderId) {
            fetchOrder(orderId);
        } else if (transactionId) {
            // Si llegamos aquí solo con transactionId, intentamos verificar primero
            fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/verify-payment`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'APPROVED' && data.orderId) {
                        fetchOrder(data.orderId);
                    } else {
                        setStatus('error');
                        setMessage(`El pago no fue aprobado. Estado: ${data.status}`);
                    }
                })
                .catch(() => {
                    setStatus('error');
                    setMessage('Error verificando el pago.');
                });
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
                        <p className="text-gray-600">Tu pedido #{order.id} ha sido confirmado.</p>
                    </div>

                    <div className="border-t border-b py-4 mb-6">
                        <h2 className="text-xl font-semibold mb-4">Resumen del Pedido</h2>
                        <div className="space-y-4">
                            {order.orderItems.map((item) => (
                                <div key={item.id} className="flex items-center justify-between">
                                    <div className="flex items-center space-x-4">
                                        <div className="relative w-16 h-16 rounded overflow-hidden">
                                            <Image
                                                src={item.product.clothingSize?.clothingColor?.image_url || '/placeholder.png'}
                                                alt={item.product_name}
                                                fill
                                                className="object-cover"
                                            />
                                        </div>
                                        <div>
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
                    </div>

                    <div className="flex justify-between items-center text-xl font-bold mb-8">
                        <span>Total Pagado</span>
                        <span>{formatPrice(order.total_payment)}</span>
                    </div>

                    <div className="bg-gray-50 p-4 rounded-lg mb-8">
                        <h3 className="font-semibold mb-2">Datos de Envío</h3>
                        <p className="text-gray-600">{order.customer.name}</p>
                        <p className="text-gray-600">{order.shipping_address}</p>
                        <p className="text-gray-600">{order.customer.current_phone_number}</p>
                        <p className="text-gray-600">{order.customer.email}</p>
                    </div>

                    <div className="text-center">
                        <Link
                            href="/"
                            className="inline-block bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-hover transition-colors duration-300"
                        >
                            Volver a la Tienda
                        </Link>
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
                    <Link
                        href="/"
                        className="inline-block bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-300"
                    >
                        Volver a la tienda
                    </Link>
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
