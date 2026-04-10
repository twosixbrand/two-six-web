'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getAuthHeaders } from '@/lib/auth';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";
import { TrackingTimeline } from "@/components/TrackingTimeline";

interface Shipment {
    id: number;
    guide_number: string;
    status: string;
    shippingProvider?: {
        name: string;
    };
    trackingHistory?: Array<{
        status: string;
        location: string;
        update_date?: string;
    }>;
    createdAt?: string;
    delivery_date?: string;
}

interface Payment {
    transaction_date: string;
    status: string;
}

interface Order {
    id: number;
    order_reference?: string;
    order_date: string;
    status: string;
    total_payment: number;
    customer: {
        name: string;
        email: string;
        current_phone_number: string;
    };
    shipments?: Shipment[];
    payments?: Payment[];
    orderItems: Array<{
        id: number;
        product_name: string;
        quantity: number;
        unit_price: number;
        product: {
            clothingSize?: {
                clothingColor?: {
                    imageClothing?: Array<{ image_url: string }>;
                }
            };
        };
    }>;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [expandedOrderId, setExpandedOrderId] = useState<number | null>(null);
    const [visibleCount, setVisibleCount] = useState(5);
    const router = useRouter();

    useEffect(() => {
        const token = localStorage.getItem('customerToken');
        const customerData = localStorage.getItem('customerData');

        if (!token || !customerData) {
            router.push('/login');
            return;
        }

        const customer = JSON.parse(customerData);
        fetchOrders(customer.email);
    }, [router]);

    const fetchOrders = async (email: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/customer/${email}`, {
                headers: { ...getAuthHeaders() },
            });
            if (!response.ok) {
                throw new Error('Error al cargar las órdenes');
            }
            const data = await response.json();
            setOrders(data);
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setLoading(false);
        }
    };

    const handleLogout = () => {
        localStorage.removeItem('customerToken');
        localStorage.removeItem('customerData');
        router.push('/login');
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-secondary/20 py-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-5xl mx-auto space-y-8">

                <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 mb-8">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary tracking-tight">Mis Pedidos</h1>
                    <div className="flex gap-4">
                        <Button variant="outline" asChild className="border-border hover:bg-secondary">
                            <Link href="/profile">Mi Perfil</Link>
                        </Button>
                        <Button
                            variant="destructive"
                            onClick={handleLogout}
                            className="bg-destructive/10 text-destructive hover:bg-destructive hover:text-white border border-destructive/20"
                        >
                            Cerrar Sesión
                        </Button>
                    </div>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm mb-6">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-20 bg-white rounded-2xl shadow-sm border border-border flex flex-col items-center justify-center min-h-[40vh]">
                        <h2 className="text-2xl font-serif text-primary mb-4">Aún no tienes pedidos</h2>
                        <p className="text-muted-foreground mb-8">Tus compras recientes aparecerán aquí una vez que realices tu primer pedido.</p>
                        <Button asChild size="lg" className="bg-primary text-secondary hover:bg-primary/90 px-8 uppercase tracking-widest">
                            <Link href="/">Descubrir Colecciones</Link>
                        </Button>
                    </div>
                ) : (
                    <div className="space-y-8">
                        {orders.slice(0, visibleCount).map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md">
                                <div className="p-6 md:p-8 bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">
                                            Orden {order.order_reference || `#${order.id}`}
                                        </p>
                                        <p className="text-lg font-serif text-primary">
                                            Realizado el {new Date(order.order_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start md:items-end gap-3">
                                        <Badge
                                            variant={
                                                order.status === 'Entregado' ? 'default' :
                                                    order.status === 'Pagado' ? 'secondary' : 'outline'
                                            }
                                            className={`text-xs uppercase tracking-wider px-3 py-1 ${order.status === 'Entregado' ? 'bg-green-100 text-green-800 hover:bg-green-100' :
                                                order.status === 'Pagado' ? 'bg-blue-100 text-blue-800 hover:bg-blue-100' :
                                                    'bg-yellow-100 text-yellow-800 border-yellow-200'
                                                }`}
                                        >
                                            {order.status}
                                        </Badge>
                                        <p className="text-xl font-bold text-accent">
                                            ${order.total_payment.toLocaleString('es-CO')}
                                        </p>
                                    </div>
                                </div>

                                <Separator />

                                <div className="p-0">
                                    <ul className="divide-y divide-border">
                                        {order.orderItems.map((item) => (
                                            <li key={item.id} className="p-6 md:p-8 flex items-center gap-6">
                                                <div className="relative h-24 w-24 md:h-32 md:w-32 bg-secondary/20 rounded-xl overflow-hidden shrink-0 border border-border">
                                                    {item.product.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ? (
                                                        <Image
                                                            src={item.product.clothingSize.clothingColor.imageClothing[0].image_url}
                                                            alt={item.product_name}
                                                            fill
                                                            className="object-cover object-center"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full flex items-center justify-center text-muted-foreground text-xs uppercase tracking-widest text-center p-2">
                                                            Sin imagen
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="flex-1 flex flex-col md:flex-row justify-between gap-4">
                                                    <div className="space-y-1">
                                                        <h4 className="font-semibold text-primary text-lg">{item.product_name}</h4>
                                                        <p className="text-sm text-muted-foreground">Cantidad: {item.quantity}</p>
                                                    </div>
                                                    <p className="font-medium text-primary">
                                                        ${item.unit_price.toLocaleString('es-CO')} c/u
                                                    </p>
                                                </div>
                                            </li>
                                        ))}
                                    </ul>
                                </div>

                                {order.shipments && order.shipments.length > 0 && (
                                    <div className="p-6 md:p-8 bg-secondary/5 border-t border-border">
                                        <h4 className="font-semibold text-primary mb-4 text-sm uppercase tracking-wider">Información de Envío</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            {order.shipments.map(shipment => (
                                                <div key={shipment.id} className="bg-white p-4 rounded-lg border border-border">
                                                    <p className="text-sm font-medium">Transportadora: <span className="text-muted-foreground">{shipment.shippingProvider?.name || 'Asignando...'}</span></p>
                                                    <p className="text-sm font-medium mt-1">Guía: <span className="text-muted-foreground">{shipment.guide_number}</span></p>
                                                    {shipment.trackingHistory && shipment.trackingHistory.length > 0 && (
                                                        <p className="text-sm font-medium mt-1">
                                                            Último estado: <span className="text-accent">{shipment.trackingHistory[0].status}</span>
                                                        </p>
                                                    )}
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                <div className="p-4 bg-white flex justify-center border-t border-border">
                                    <Button
                                        variant={expandedOrderId === order.id ? "default" : "outline"}
                                        onClick={() => setExpandedOrderId(expandedOrderId === order.id ? null : order.id)}
                                        className={`w-full max-w-sm ${expandedOrderId === order.id ? 'bg-accent hover:bg-accent/90' : 'border-accent text-accent hover:bg-accent hover:text-white'}`}
                                    >
                                        <span className="uppercase tracking-wider font-bold">
                                            {expandedOrderId === order.id ? 'Ocultar Rastreo' : 'Rastrear Pedido'}
                                        </span>
                                    </Button>
                                </div>

                                {expandedOrderId === order.id && (
                                    <div className="p-6 md:p-8 bg-white border-t border-border animate-fade-in">
                                        <TrackingTimeline order={order as any} />
                                    </div>
                                )}
                            </div>
                        ))}

                        {visibleCount < orders.length && (
                            <div className="flex justify-center pt-8 pb-4">
                                <Button
                                    variant="outline"
                                    size="lg"
                                    onClick={() => setVisibleCount((prev) => prev + 5)}
                                    className="px-8 border-border text-primary hover:bg-secondary bg-white rounded-full font-semibold uppercase tracking-widest text-sm shadow-sm hover:shadow transition-all"
                                >
                                    Cargar más pedidos
                                </Button>
                            </div>
                        )}
                    </div>
                )}
            </div>
        </div>
    );
}
