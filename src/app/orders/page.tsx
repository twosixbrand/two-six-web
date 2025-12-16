'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

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
            image_url: string;
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
        } catch (err: any) {
            setError(err.message);
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
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto">
                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl font-bold text-gray-900">Mis Pedidos</h1>
                    <button
                        onClick={handleLogout}
                        className="flex items-center gap-2 px-4 py-2 text-sm font-medium text-red-600 bg-white border border-red-200 rounded-md hover:bg-red-50 hover:text-red-700 transition-colors duration-200 shadow-sm"
                    >
                        <svg xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor" className="w-4 h-4">
                            <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15M12 9l-3 3m0 0l3 3m-3-3h12.75" />
                        </svg>
                        Cerrar Sesión
                    </button>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {orders.length === 0 ? (
                    <div className="text-center py-12 bg-white rounded-lg shadow">
                        <p className="text-gray-500 text-lg">No tienes pedidos registrados.</p>
                        <Link href="/" className="mt-4 inline-block text-black underline">
                            Ir a la tienda
                        </Link>
                    </div>
                ) : (
                    <div className="space-y-6">
                        {orders.map((order) => (
                            <div key={order.id} className="bg-white shadow overflow-hidden sm:rounded-lg">
                                <div className="px-4 py-5 sm:px-6 flex justify-between items-center bg-gray-50">
                                    <div>
                                        <h3 className="text-lg leading-6 font-medium text-gray-900">
                                            Pedido #{order.id}
                                        </h3>
                                        <p className="mt-1 max-w-2xl text-sm text-gray-500">
                                            Fecha: {new Date(order.order_date).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div className="text-right">
                                        <span className={`px-2 inline-flex text-xs leading-5 font-semibold rounded-full ${order.status === 'Entregado' ? 'bg-green-100 text-green-800' :
                                            order.status === 'Pagado' ? 'bg-blue-100 text-blue-800' :
                                                'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {order.status}
                                        </span>
                                        <p className="mt-1 text-sm font-bold text-gray-900">
                                            ${order.total_payment.toLocaleString('es-CO')}
                                        </p>
                                    </div>
                                </div>
                                <div className="border-t border-gray-200">
                                    <ul className="divide-y divide-gray-200">
                                        {order.orderItems.map((item) => (
                                            <li key={item.id} className="px-4 py-4 flex items-center">
                                                <div className="flex-shrink-0 h-16 w-16 border border-gray-200 rounded-md overflow-hidden">
                                                    {item.product.image_url ? (
                                                        <img
                                                            src={item.product.image_url}
                                                            alt={item.product_name}
                                                            className="h-full w-full object-cover object-center"
                                                        />
                                                    ) : (
                                                        <div className="h-full w-full bg-gray-200 flex items-center justify-center text-gray-400">
                                                            No img
                                                        </div>
                                                    )}
                                                </div>
                                                <div className="ml-4 flex-1">
                                                    <div className="flex justify-between">
                                                        <h4 className="text-sm font-medium text-gray-900">{item.product_name}</h4>
                                                        <p className="text-sm font-medium text-gray-900">
                                                            ${item.unit_price.toLocaleString('es-CO')}
                                                        </p>
                                                    </div>
                                                    <p className="text-sm text-gray-500">Cant: {item.quantity}</p>
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
