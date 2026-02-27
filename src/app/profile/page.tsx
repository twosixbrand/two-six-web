'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
        <div className="min-h-screen bg-secondary/20 py-16 px-4 sm:px-6 lg:px-8 font-sans">
            <div className="max-w-4xl mx-auto space-y-8">

                <div className="flex justify-between items-center mb-8">
                    <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary tracking-tight">Mi Cuenta</h1>
                    <Button variant="outline" asChild className="border-border hover:bg-secondary">
                        <Link href="/orders">Ver Mis Pedidos</Link>
                    </Button>
                </div>

                {error && (
                    <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg text-sm">
                        {error}
                    </div>
                )}

                {success && (
                    <div className="bg-green-100 border border-green-500 text-green-700 px-4 py-3 rounded-lg text-sm">
                        {success}
                    </div>
                )}

                <Tabs defaultValue="datos" className="w-full">
                    <TabsList className="grid w-full grid-cols-2 mb-8 h-14 bg-secondary/30 rounded-xl p-1">
                        <TabsTrigger value="datos" className="text-sm uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">Datos Personales</TabsTrigger>
                        <TabsTrigger value="direcciones" className="text-sm uppercase tracking-widest data-[state=active]:bg-white data-[state=active]:shadow-sm rounded-lg">Mis Direcciones</TabsTrigger>
                    </TabsList>

                    {/* Tab: Datos Personales */}
                    <TabsContent value="datos" className="space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
                            <h2 className="text-xl font-serif font-bold text-primary mb-6">Información Personal</h2>
                            <div className="space-y-6">
                                <form onSubmit={handleSubmit} className="space-y-6">
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                        <div className="space-y-2">
                                            <Label htmlFor="name">Nombre Completo</Label>
                                            <Input
                                                type="text"
                                                name="name"
                                                id="name"
                                                value={formData.name}
                                                onChange={handleChange}
                                                className="h-12 bg-secondary/10 border-gray-200 focus:border-primary"
                                            />
                                        </div>

                                        <div className="space-y-2">
                                            <Label htmlFor="current_phone_number">Teléfono</Label>
                                            <Input
                                                type="tel"
                                                name="current_phone_number"
                                                id="current_phone_number"
                                                value={formData.current_phone_number}
                                                onChange={handleChange}
                                                className="h-12 bg-secondary/10 border-gray-200 focus:border-primary"
                                            />
                                        </div>
                                    </div>

                                    <div className="flex justify-end pt-4 border-t border-border mt-8">
                                        <Button
                                            type="submit"
                                            disabled={saving}
                                            className="bg-primary text-secondary hover:bg-primary/90 px-8 py-6 text-sm uppercase tracking-widest w-full md:w-auto"
                                        >
                                            {saving ? 'Guardando...' : 'Guardar Cambios'}
                                        </Button>
                                    </div>
                                </form>
                            </div>
                        </div>
                    </TabsContent>

                    {/* Tab: Direcciones */}
                    <TabsContent value="direcciones" className="space-y-6">
                        <div className="bg-white p-8 rounded-2xl shadow-sm border border-border">
                            <div className="flex justify-between items-center mb-6">
                                <h2 className="text-xl font-serif font-bold text-primary">Libreta de Direcciones</h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setShowAddressForm(!showAddressForm)}
                                    className="border-primary text-primary hover:bg-secondary"
                                >
                                    {showAddressForm ? 'Cancelar' : 'Agregar Dirección'}
                                </Button>
                            </div>

                            {showAddressForm && (
                                <div className="mb-8 p-6 bg-secondary/10 rounded-xl border border-border">
                                    <form onSubmit={handleAddAddress} className="space-y-6">
                                        <h3 className="font-medium mb-6 uppercase tracking-wider text-sm text-primary">Nueva Dirección</h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                            <div className="md:col-span-2 space-y-2">
                                                <Label>Dirección Principal</Label>
                                                <Input type="text" name="address" required value={newAddress.address} onChange={handleAddressChange} className="h-12 bg-white" placeholder="Ej: Calle 123 # 45-67" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Detalle (Opcional)</Label>
                                                <Input type="text" name="detail" value={newAddress.detail} onChange={handleAddressChange} className="h-12 bg-white" placeholder="Apto, Casa, etc." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Indicaciones (Opcional)</Label>
                                                <Input type="text" name="instructions" value={newAddress.instructions} onChange={handleAddressChange} className="h-12 bg-white" placeholder="Dejar en portería..." />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Ciudad</Label>
                                                <Input type="text" name="city" required value={newAddress.city} onChange={handleAddressChange} className="h-12 bg-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Departamento/Estado</Label>
                                                <Input type="text" name="state" required value={newAddress.state} onChange={handleAddressChange} className="h-12 bg-white" />
                                            </div>
                                            <div className="space-y-2">
                                                <Label>Código Postal</Label>
                                                <Input type="text" name="postal_code" required value={newAddress.postal_code} onChange={handleAddressChange} className="h-12 bg-white" />
                                            </div>

                                            <div className="md:col-span-2 flex items-center mt-2">
                                                <input type="checkbox" name="is_default" id="is_default" checked={newAddress.is_default} onChange={handleAddressChange} className="h-5 w-5 rounded border-gray-300 text-primary focus:ring-primary" />
                                                <Label htmlFor="is_default" className="ml-3 text-sm cursor-pointer">Establecer como dirección de envío predeterminada</Label>
                                            </div>
                                        </div>

                                        <div className="mt-8 flex justify-end">
                                            <Button type="submit" className="bg-accent text-primary hover:bg-accent/90 px-8">
                                                Guardar Dirección
                                            </Button>
                                        </div>
                                    </form>
                                </div>
                            )}

                            <div className="space-y-4">
                                {addresses.length === 0 ? (
                                    <p className="text-muted-foreground text-center py-8">No tienes direcciones guardadas en tu libreta.</p>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        {addresses.map((addr) => (
                                            <div key={addr.id} className="border border-border rounded-xl p-5 relative hover:border-primary/30 transition-colors bg-white">
                                                <div className="pr-12">
                                                    <p className="font-semibold text-primary text-lg mb-1">{addr.address} {addr.detail && ` - ${addr.detail}`}</p>
                                                    <p className="text-sm text-muted-foreground mb-1">{addr.city}, {addr.state} {addr.postal_code}</p>
                                                    {addr.instructions && <p className="text-xs text-muted-foreground/80 italic mt-2">&quot;{addr.instructions}&quot;</p>}

                                                    {addr.is_default && (
                                                        <span className="inline-block bg-accent/20 text-accent-foreground text-xs font-semibold px-2 py-1 rounded mt-3 uppercase tracking-wider">
                                                            Predeterminada
                                                        </span>
                                                    )}
                                                </div>
                                                <button
                                                    onClick={() => handleDeleteAddress(addr.id)}
                                                    className="absolute top-5 right-5 text-muted-foreground hover:text-destructive transition-colors"
                                                    title="Eliminar"
                                                >
                                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"><path d="M3 6h18" /><path d="M19 6v14c0 1-1 2-2 2H7c-1 0-2-1-2-2V6" /><path d="M8 6V4c0-1 1-2 2-2h4c1 0 2 1 2 2v2" /><line x1="10" x2="10" y1="11" y2="17" /><line x1="14" x2="14" y1="11" y2="17" /></svg>
                                                </button>
                                            </div>
                                        ))}
                                    </div>
                                )}
                            </div>
                        </div>
                    </TabsContent>
                </Tabs>
            </div>
        </div>
    );
}
