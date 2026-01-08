"use client";

import { useState, useEffect, useMemo } from "react";
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

    // Address management
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");

    const [formData, setFormData] = useState({
        name: "",
        email: "",
        phone: "",
        address: "",
        detail: "", // New field
        instructions: "", // New field
        city: "",
        department: "",
    });

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await getDepartments();
                setDepartments(data);

                // Check for logged-in user
                const customerData = localStorage.getItem('customerData');
                if (customerData) {
                    const customer = JSON.parse(customerData);

                    // Fetch saved addresses
                    try {
                        const addrResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/address/customer/${customer.id}`);
                        if (addrResponse.ok) {
                            const addresses = await addrResponse.json();
                            setSavedAddresses(addresses);

                            // If there is a default address, use it
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const defaultAddr = addresses.find((a: any) => a.is_default);
                            if (defaultAddr) {
                                setSelectedAddressId(defaultAddr.id.toString());
                                fillFormWithAddress(defaultAddr, customer, data);
                            } else {
                                // Fallback to customer profile data
                                setFormData(prev => ({
                                    ...prev,
                                    name: customer.name || "",
                                    email: customer.email || "",
                                    phone: customer.current_phone_number || "",
                                    address: customer.shipping_address || "",
                                    city: customer.city || "",
                                    department: customer.state || "",
                                }));
                                matchLocation(customer.state, customer.city, data);
                            }
                        } else {
                            // Fallback to customer profile data if address fetch fails
                            setFormData(prev => ({
                                ...prev,
                                name: customer.name || "",
                                email: customer.email || "",
                                phone: customer.current_phone_number || "",
                                address: customer.shipping_address || "",
                                city: customer.city || "",
                                department: customer.state || "",
                            }));
                            matchLocation(customer.state, customer.city, data);
                        }
                    } catch (e) {
                        console.error("Error fetching addresses", e);
                        // Fallback to customer profile data
                        setFormData(prev => ({
                            ...prev,
                            name: customer.name || "",
                            email: customer.email || "",
                            phone: customer.current_phone_number || "",
                            address: customer.shipping_address || "",
                            city: customer.city || "",
                            department: customer.state || "",
                        }));
                        matchLocation(customer.state, customer.city, data);
                    }
                }

            } catch {
                setError("Error al cargar los departamentos. Por favor recarga la página.");
            } finally {
                setLoadingLocations(false);
            }
        };
        fetchDepartments();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, []);

    const matchLocation = async (stateName: string, cityName: string, depts: Department[]) => {
        if (stateName) {
            const dept = depts.find((d: Department) => d.name.toLowerCase() === stateName.toLowerCase());
            if (dept) {
                setSelectedDepartment(dept);
                try {
                    const citiesData = await getCities(dept.id);
                    setCities(citiesData);

                    if (cityName) {
                        const city = citiesData.find((c: City) => c.name.toLowerCase() === cityName.toLowerCase());
                        if (city) {
                            setSelectedCity(city);
                            setShippingCost(city.shipping_cost || 0);
                        }
                    }
                } catch (error) {
                    console.error("Error fetching cities:", error);
                }
            }
        }
    };

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const fillFormWithAddress = (address: any, customer: any, depts: Department[]) => {
        setFormData(prev => ({
            ...prev,
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.current_phone_number || "",
            address: address.address,
            detail: address.detail || "",
            instructions: address.instructions || "",
            city: address.city,
            department: address.state,
        }));
        matchLocation(address.state, address.city, depts);
    };

    const handleAddressSelection = (e: React.ChangeEvent<HTMLSelectElement>) => {
        const addrId = e.target.value;
        setSelectedAddressId(addrId);

        if (addrId === "new") {
            setFormData(prev => ({
                ...prev,
                address: "",
                detail: "",
                instructions: "",
                city: "",
                department: "",
            }));
            setSelectedDepartment(null);
            setSelectedCity(null);
            setShippingCost(0);
        } else {
            const address = savedAddresses.find(a => a.id.toString() === addrId);
            if (address) {
                const customerData = localStorage.getItem('customerData');
                const customer = customerData ? JSON.parse(customerData) : {};
                fillFormWithAddress(address, customer, departments);
            }
        }
    };

    const paymentHandlers = useMemo(() => ({
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
    }), [router]);

    const { startPaymentFlow, loadingPayment } = useWompiPayment(paymentHandlers);

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
                productName: item.name || item.clothingSize?.clothingColor?.design?.clothing?.name || "Producto desconocido",
                size: item.clothingSize.size.name,
                color: item.clothingSize.clothingColor.color.name,
                image: item.clothingSize.clothingColor.image_url || "https://example.com/placeholder.png",
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

            {savedAddresses.length > 0 && (
                <div className="mb-6">
                    <label className="block text-sm font-medium text-primary/80 mb-2">Mis Direcciones Guardadas</label>
                    <select
                        value={selectedAddressId}
                        onChange={handleAddressSelection}
                        className="block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm p-2 border"
                    >
                        <option value="new">Usar una nueva dirección</option>
                        {savedAddresses.map(addr => (
                            <option key={addr.id} value={addr.id}>
                                {addr.address} - {addr.city} {addr.is_default ? '(Predeterminada)' : ''}
                            </option>
                        ))}
                    </select>
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

                <div>
                    <label htmlFor="detail" className="block text-sm font-medium text-primary/80">Detalle (Apto, Unidad, etc.)</label>
                    <input
                        type="text"
                        id="detail"
                        name="detail"
                        value={formData.detail}
                        onChange={handleChange}
                        className="mt-1 block w-full rounded-md border-gray-300 shadow-sm focus:border-accent focus:ring-accent sm:text-sm p-2 border"
                    />
                </div>

                <div>
                    <label htmlFor="instructions" className="block text-sm font-medium text-primary/80">Indicaciones de Entrega</label>
                    <input
                        type="text"
                        id="instructions"
                        name="instructions"
                        value={formData.instructions}
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

