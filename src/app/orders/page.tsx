'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import Image from "next/image";

interface Order {
    id: number;
    order_date: string;
    status: string;
    total_payment: number;
    orderItems: Array<{
        id: number;
        product_name: string;
        quantity: number;
        unit_price: number;
        product: {
            clothingSize: {
                clothingColor: {
                    image_url?: string;
                }
            };
        };
    }>;
}

export default function OrdersPage() {
    const [orders, setOrders] = useState<Order[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
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
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/customer/${email}`);
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
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white rounded-2xl shadow-sm border border-border overflow-hidden transition-all hover:shadow-md">
                                <div className="p-6 md:p-8 bg-secondary/10 flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
                                    <div className="space-y-1">
                                        <p className="text-sm font-semibold text-muted-foreground uppercase tracking-wider">Pedido #{order.id}</p>
                                        <p className="text-lg font-serif text-primary">
                                            Realizado el {new Date(order.order_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start md:items-end gap-2">
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
                                                    {item.product.clothingSize?.clothingColor?.image_url ? (
                                                        <Image
                                                            src={item.product.clothingSize.clothingColor.image_url}
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
                            </div>
                        ))}
                    </div>
                )}
            </div>
        </div>
    );
}
