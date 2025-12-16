'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

export default function ProfilePage() {
    const [formData, setFormData] = useState({
        name: '',
        current_phone_number: '',
        shipping_address: '',
        city: '',
        state: '',
        postal_code: '',
        country: '',
    });
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const router = useRouter();

    useEffect(() => {
        const customerData = localStorage.getItem('customerData');
        if (!customerData) {
            router.push('/login');
            return;
        }

        const customer = JSON.parse(customerData);
        fetchCustomer(customer.id);
    }, [router]);

    const fetchCustomer = async (id: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/${id}`);
            if (!response.ok) {
                throw new Error('Error al cargar datos del perfil');
            }
            const data = await response.json();
            setFormData({
                name: data.name || '',
                current_phone_number: data.current_phone_number || '',
                shipping_address: data.shipping_address || '',
                city: data.city || '',
                state: data.state || '',
                postal_code: data.postal_code || '',
                country: data.country || '',
            });
        } catch (err: any) {
            setError(err.message);
        } finally {
            setLoading(false);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSaving(true);
        setError('');
        setSuccess('');

        const customerData = localStorage.getItem('customerData');
        if (!customerData) return;
        const { id } = JSON.parse(customerData);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/${id}`, {
                method: 'PATCH',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify(formData),
            });

            if (!response.ok) {
                throw new Error('Error al actualizar el perfil');
            }

            const updatedCustomer = await response.json();
            localStorage.setItem('customerData', JSON.stringify(updatedCustomer));
            setSuccess('Perfil actualizado correctamente');

            // Optional: Redirect back to orders after a delay
            // setTimeout(() => router.push('/orders'), 2000);
        } catch (err: any) {
            setError(err.message);
        } finally {
            setSaving(false);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-3xl mx-auto bg-white p-8 rounded-lg shadow-md">
                <div className="flex justify-between items-center mb-6">
                    <h1 className="text-2xl font-bold text-gray-900">Editar Perfil</h1>
                    <Link href="/orders" className="text-sm text-blue-600 hover:text-blue-800">
                        Volver a Mis Pedidos
                    </Link>
                </div>

                {error && (
                    <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-400 text-green-700 px-4 py-3 rounded mb-4">
                        {success}
                    </div>
                )}

                <form onSubmit={handleSubmit} className="space-y-6">
                    <div className="grid grid-cols-1 gap-y-6 gap-x-4 sm:grid-cols-2">
                        <div className="sm:col-span-2">
                            <label htmlFor="name" className="block text-sm font-medium text-gray-700">
                                Nombre Completo
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="name"
                                    id="name"
                                    autoComplete="name"
                                    value={formData.name}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="current_phone_number" className="block text-sm font-medium text-gray-700">
                                Teléfono
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="current_phone_number"
                                    id="current_phone_number"
                                    autoComplete="tel"
                                    value={formData.current_phone_number}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div className="sm:col-span-2">
                            <label htmlFor="shipping_address" className="block text-sm font-medium text-gray-700">
                                Dirección de Envío
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="shipping_address"
                                    id="shipping_address"
                                    autoComplete="street-address"
                                    value={formData.shipping_address}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="city" className="block text-sm font-medium text-gray-700">
                                Ciudad
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="city"
                                    id="city"
                                    autoComplete="address-level2"
                                    value={formData.city}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="state" className="block text-sm font-medium text-gray-700">
                                Departamento/Estado
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="state"
                                    id="state"
                                    autoComplete="address-level1"
                                    value={formData.state}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="postal_code" className="block text-sm font-medium text-gray-700">
                                Código Postal
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="postal_code"
                                    id="postal_code"
                                    autoComplete="postal-code"
                                    value={formData.postal_code}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>

                        <div>
                            <label htmlFor="country" className="block text-sm font-medium text-gray-700">
                                País
                            </label>
                            <div className="mt-1">
                                <input
                                    type="text"
                                    name="country"
                                    id="country"
                                    autoComplete="country-name"
                                    value={formData.country}
                                    onChange={handleChange}
                                    className="shadow-sm focus:ring-black focus:border-black block w-full sm:text-sm border-gray-300 rounded-md p-2 border"
                                />
                            </div>
                        </div>
                    </div>

                    <div className="flex justify-end">
                        <button
                            type="submit"
                            disabled={saving}
                            className="ml-3 inline-flex justify-center py-2 px-4 border border-transparent shadow-sm text-sm font-medium rounded-md text-white bg-black hover:bg-gray-800 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-black disabled:opacity-50"
                        >
                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
}
