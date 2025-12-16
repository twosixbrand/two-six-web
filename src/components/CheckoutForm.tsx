"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { useCart } from "@/context/CartContext";
import { useWompiPayment } from "@/hooks/useWompiPayment";
import { getDepartments, getCities, Department, City } from "@/services/locationApi";

interface WompiTransaction {
    id: string;
    reference: string;
    status: string;
    [key: string]: unknown;
}

export default function CheckoutForm() {
    const router = useRouter();
    const { cartItems, cartTotal, itemCount } = useCart();
    const [error, setError] = useState<string | null>(null);

    const [departments, setDepartments] = useState<Department[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(true);
    const [shippingCost, setShippingCost] = useState(0);
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        city: "",
        department: "",
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await getDepartments();
                setDepartments(data);
            } catch {
                setError("Error al cargar los departamentos. Por favor recarga la página.");
            } finally {
                setLoadingLocations(false);
            }
        };
        fetchDepartments();
    }, []);

    const { startPaymentFlow, loadingPayment } = useWompiPayment({
        onSuccess: (transaction: WompiTransaction) => {
            const referenceParts = transaction.reference.split('-');
            let orderId = transaction.reference;
            if (referenceParts.length >= 2 && referenceParts[0] === 'ORDER') {
                orderId = referenceParts[1];
            }
            router.push(`/checkout/success?orderId=${orderId}&transactionId=${transaction.id}`);
        },
        onError: (msg: string) => setError(msg),
        onCancel: () => { }
    });

    const handleChange = async (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDepartmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const departmentId = parseInt(e.target.value);
        const department = departments.find((d) => d.id === departmentId);
        setSelectedDepartment(department || null);
        setSelectedCity(null);
        setShippingCost(0); // Reset shipping cost until city is selected
        setFormData((prev) => ({ ...prev, department: department ? department.name : "", city: "" }));

        if (departmentId) {
            try {
                const citiesData = await getCities(departmentId);
                setCities(citiesData);
            } catch (error) {
                console.error("Error fetching cities:", error);
            }
        } else {
            setCities([]);
        }
    };

    const handleCityChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const cityId = parseInt(e.target.value);
        const city = cities.find((c) => c.id === cityId);
        setSelectedCity(city || null);
        setFormData((prev) => ({ ...prev, city: city ? city.name : "" }));

        if (city) {
            setShippingCost(city.shipping_cost || 0);
        } else {
            setShippingCost(0);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        const totalWithShipping = cartTotal + (shippingCost || 0);

        const checkoutData = {
            customer: formData,
            items: cartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                productName: item.name || item.designClothing?.design?.clothing?.name || "Producto desconocido",
                size: item.designClothing.size.name,
                color: item.designClothing.color.name,
                image: item.image_url || "https://example.com/placeholder.png",
            })),
            total: totalWithShipping,
            shippingCost: shippingCost || 0, // Send shipping cost to backend
        };

        await startPaymentFlow(checkoutData);
    };

    if (itemCount === 0) {
        return null;
    }

    return (
        <form onSubmit={handleSubmit} className="bg-white p-6 rounded-lg shadow-md">
            <h2 className="text-2xl font-bold text-primary mb-6">Datos de Envío</h2>

            {error && (
                <div className="bg-red-100 border border-red-400 text-red-700 px-4 py-3 rounded mb-4">
                    {error}
                </div>
            )}

            <div className="space-y-4">
                <div>
                    <label htmlFor="name" className="block text-sm font-medium text-primary/80">Nombre Completo</label>
                    <input
                        type="text"
                        id="name"
                        name="name"
                        required
                        value={formData.name}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="email" className="block text-sm font-medium text-primary/80">Correo Electrónico</label>
                    <input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="phone" className="block text-sm font-medium text-primary/80">Teléfono</label>
                    <input
                        type="tel"
                        id="phone"
                        name="phone"
                        required
                        value={formData.phone}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm p-2 border"
                    />
                </div>

                <div className="grid grid-cols-2 gap-4">
                    <div>
                        <label htmlFor="department" className="block text-sm font-medium text-primary/80">Departamento</label>
                        <select
                            id="department"
                            name="department"
                            required
                            value={selectedDepartment ? selectedDepartment.id : ""}
                            onChange={handleDepartmentChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm p-2 border"
                            disabled={loadingLocations}
                        >
                            <option value="">Seleccione...</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>
                    <div>
                        <label htmlFor="city" className="block text-sm font-medium text-primary/80">Ciudad / Municipio</label>
                        <select
                            id="city"
                            name="city"
                            required
                            value={selectedCity ? selectedCity.id : ""}
                            onChange={handleCityChange}
                            className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm p-2 border"
                            disabled={!selectedDepartment}
                        >
                            <option value="">Seleccione...</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div>
                    <label htmlFor="address" className="block text-sm font-medium text-primary/80">Dirección de Envío</label>
                    <input
                        type="text"
                        id="address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm p-2 border"
                    />
                </div>
            </div>

            <div className="mt-6 border-t pt-4">
                <div className="flex justify-between text-sm mb-2">
                    <span>Subtotal:</span>
                    <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-sm mb-2">
                    <span>Envío:</span>
                    <span>${(shippingCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between text-xl font-bold text-primary mt-2">
                    <span>Total:</span>
                    <span>${(cartTotal + (shippingCost || 0)).toLocaleString()}</span>
                </div>
            </div>

            <button
                type="submit"
                disabled={loadingPayment}
                className="mt-6 w-full bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-300 shadow-md disabled:bg-gray-400"
            >
                {loadingPayment ? "Procesando..." : "Pagar Ahora"}
            </button>
        </form>
    );
}

