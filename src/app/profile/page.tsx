'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';

interface Address {
    id: number;
    address: string;
    detail?: string;
    instructions?: string;
    city: string;
    state: string;
    postal_code: string;
    country: string;
    is_default: boolean;
}

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
    const [addresses, setAddresses] = useState<Address[]>([]);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState('');
    const [success, setSuccess] = useState('');
    const [showAddressForm, setShowAddressForm] = useState(false);
    const [newAddress, setNewAddress] = useState({
        address: '',
        detail: '',
        instructions: '',
        city: '',
        state: '',
        postal_code: '',
        country: 'Colombia',
        is_default: false,
    });

    const router = useRouter();

    useEffect(() => {
        const customerData = localStorage.getItem('customerData');
        if (!customerData) {
            router.push('/login');
            return;
        }

        const customer = JSON.parse(customerData);
        fetchCustomer(customer.id);
        fetchAddresses(customer.id);
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

    const fetchAddresses = async (customerId: number) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/address/customer/${customerId}`);
            if (response.ok) {
                const data = await response.json();
                setAddresses(data);
            }
        } catch (error) {
            console.error("Error fetching addresses", error);
        }
    };

    const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        setFormData({ ...formData, [e.target.name]: e.target.value });
    };

    const handleAddressChange = (e: React.ChangeEvent<HTMLInputElement>) => {
        const value = e.target.type === 'checkbox' ? e.target.checked : e.target.value;
        setNewAddress({ ...newAddress, [e.target.name]: value });
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
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        } finally {
            setSaving(false);
        }
    };

    const handleAddAddress = async (e: React.FormEvent) => {
        e.preventDefault();
        const customerData = localStorage.getItem('customerData');
        if (!customerData) return;
        const { id } = JSON.parse(customerData);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/address`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({ ...newAddress, id_customer: id }),
            });

            if (!response.ok) {
                throw new Error('Error al guardar la dirección');
            }

            await fetchAddresses(id);
            setShowAddressForm(false);
            setNewAddress({
                address: '',
                detail: '',
                instructions: '',
                city: '',
                state: '',
                postal_code: '',
                country: 'Colombia',
                is_default: false,
            });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message);
            } else {
                setError('An unexpected error occurred');
            }
        }
    };

    const handleDeleteAddress = async (addressId: number) => {
        if (!confirm('¿Estás seguro de eliminar esta dirección?')) return;

        const customerData = localStorage.getItem('customerData');
        if (!customerData) return;
        const { id } = JSON.parse(customerData);

        try {
            await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/address/${addressId}`, {
                method: 'DELETE',
            });
            await fetchAddresses(id);
        } catch (error) {
            console.error("Error deleting address", error);
        }
    };

    if (loading) {
        return <div className="min-h-screen flex items-center justify-center">Cargando...</div>;
    }

    return (
        <div className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
            <div className="max-w-4xl mx-auto space-y-8">

                {/* Profile Info */}
                <div className="bg-white p-8 rounded-lg shadow-md">
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

                {/* Address Management */}
                <div className="bg-white p-8 rounded-lg shadow-md">
                    <div className="flex justify-between items-center mb-6">
                        <h2 className="text-xl font-bold text-gray-900">Mis Direcciones</h2>
                        <button
                            onClick={() => setShowAddressForm(!showAddressForm)}
                            className="text-sm bg-gray-200 hover:bg-gray-300 px-3 py-1 rounded-md transition-colors"
                        >
                            {showAddressForm ? 'Cancelar' : 'Agregar Nueva Dirección'}
                        </button>
                    </div>

                    {showAddressForm && (
                        <form onSubmit={handleAddAddress} className="mb-8 bg-gray-50 p-4 rounded-md border border-gray-200">
                            <h3 className="text-lg font-medium mb-4">Nueva Dirección</h3>
                            <div className="grid grid-cols-1 gap-y-4 gap-x-4 sm:grid-cols-2">
                                <div className="sm:col-span-2">
                                    <label className="block text-sm font-medium text-gray-700">Dirección</label>
                                    <input type="text" name="address" required value={newAddress.address} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Detalle (Apto, Unidad, etc.)</label>
                                    <input type="text" name="detail" value={newAddress.detail} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Indicaciones</label>
                                    <input type="text" name="instructions" value={newAddress.instructions} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Ciudad</label>
                                    <input type="text" name="city" required value={newAddress.city} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Departamento</label>
                                    <input type="text" name="state" required value={newAddress.state} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                                </div>
                                <div>
                                    <label className="block text-sm font-medium text-gray-700">Código Postal</label>
                                    <input type="text" name="postal_code" required value={newAddress.postal_code} onChange={handleAddressChange} className="mt-1 block w-full rounded-md border-gray-300 shadow-sm p-2 border" />
                                </div>
                                <div className="sm:col-span-2 flex items-center">
                                    <input type="checkbox" name="is_default" id="is_default" checked={newAddress.is_default} onChange={handleAddressChange} className="h-4 w-4 text-black focus:ring-black border-gray-300 rounded" />
                                    <label htmlFor="is_default" className="ml-2 block text-sm text-gray-900">Establecer como predeterminada</label>
                                </div>
                            </div>
                            <div className="mt-4 flex justify-end">
                                <button type="submit" className="bg-black text-white px-4 py-2 rounded-md hover:bg-gray-800">Guardar Dirección</button>
                            </div>
                        </form>
                    )}

                    <div className="space-y-4">
                        {addresses.length === 0 ? (
                            <p className="text-gray-500">No tienes direcciones guardadas.</p>
                        ) : (
                            addresses.map((addr) => (
                                <div key={addr.id} className="border rounded-md p-4 flex justify-between items-start relative">
                                    <div>
                                        <p className="font-medium">{addr.address} {addr.detail && ` - ${addr.detail}`}</p>
                                        <p className="text-sm text-gray-600">{addr.city}, {addr.state} - {addr.postal_code}</p>
                                        {addr.instructions && <p className="text-sm text-gray-500 italic">&quot;{addr.instructions}&quot;</p>}
                                        {addr.is_default && <span className="inline-block bg-green-100 text-green-800 text-xs px-2 py-0.5 rounded mt-2">Predeterminada</span>}
                                    </div>
                                    <button onClick={() => handleDeleteAddress(addr.id)} className="text-red-600 hover:text-red-800 text-sm">Eliminar</button>
                                </div>
                            ))
                        )}
                    </div>
                </div>

            </div>
        </div>
    );
}
