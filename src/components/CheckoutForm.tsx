"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWompiPayment } from "@/hooks/useWompiPayment";
import { getDepartments, getCities, Department, City } from "@/services/locationApi";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";

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
    const [acceptTerms, setAcceptTerms] = useState(false);

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

        if (!acceptTerms) {
            setError("Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar con el pago.");
            return;
        }

        const totalWithShipping = cartTotal + (shippingCost || 0);

        const checkoutData = {
            customer: formData,
            items: cartItems.map((item) => ({
                productId: item.id,
                quantity: item.quantity,
                price: item.price,
                productName: item.name || item.clothingSize?.clothingColor?.design?.clothing?.name || "Producto desconocido",
                size: item.clothingSize?.size?.name || "N/A",
                color: item.clothingSize?.clothingColor?.color?.name || "N/A",
                image: item.clothingSize?.clothingColor?.image_url || "https://example.com/placeholder.png",
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
        <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-border">
            <h2 className="text-2xl font-serif font-bold text-primary mb-8 tracking-tight">Datos de Envío</h2>

            {/* Login Prompt Banner */}
            {!localStorage.getItem('customerToken') && (
                <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl flex flex-col sm:flex-row items-center justify-between gap-4 animate-in fade-in slide-in-from-top-4 duration-500">
                    <div>
                        <h3 className="text-lg font-serif font-semibold text-primary">¿Ya tienes una cuenta?</h3>
                        <p className="text-sm text-muted-foreground mt-1">Inicia sesión rápidamente con tu correo electrónico para autocompletar tus datos y direcciones guardadas.</p>
                    </div>
                    <Button
                        type="button"
                        variant="outline"
                        className="whitespace-nowrap border-primary text-primary hover:bg-primary hover:text-white transition-colors uppercase tracking-widest px-6"
                        onClick={() => {
                            sessionStorage.setItem('preLoginPath', '/checkout');
                            router.push('/login');
                        }}
                    >
                        Iniciar Sesión
                    </Button>
                </div>
            )}

            {error && (
                <div className="bg-destructive/10 border border-destructive text-destructive px-4 py-3 rounded-lg mb-6 text-sm">
                    {error}
                </div>
            )}

            {savedAddresses.length > 0 && (
                <div className="mb-8 p-4 bg-secondary/30 rounded-xl border border-border">
                    <Label className="text-primary font-semibold mb-3">Mis Direcciones Guardadas</Label>
                    <select
                        value={selectedAddressId}
                        onChange={handleAddressSelection}
                        className="w-full bg-white rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm p-3 border outline-none transition-colors"
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

            <div className="space-y-6">
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="name">Nombre Completo</Label>
                        <Input
                            type="text"
                            id="name"
                            name="name"
                            required
                            value={formData.name}
                            onChange={handleChange}
                            className="h-12 bg-secondary/10 border-gray-200 focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="phone">Teléfono</Label>
                        <Input
                            type="tel"
                            id="phone"
                            name="phone"
                            required
                            value={formData.phone}
                            onChange={handleChange}
                            className="h-12 bg-secondary/10 border-gray-200 focus:border-primary focus:ring-primary"
                        />
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="email">Correo Electrónico</Label>
                    <Input
                        type="email"
                        id="email"
                        name="email"
                        required
                        value={formData.email}
                        onChange={handleChange}
                        className="h-12 bg-secondary/10 border-gray-200 focus:border-primary focus:ring-primary"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border mt-6">
                    <div className="space-y-2">
                        <Label htmlFor="department">Departamento</Label>
                        <select
                            id="department"
                            name="department"
                            required
                            value={selectedDepartment ? selectedDepartment.id : ""}
                            onChange={handleDepartmentChange}
                            className="w-full h-12 bg-secondary/10 rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm px-3 border outline-none transition-colors"
                            disabled={loadingLocations}
                        >
                            <option value="">Seleccione un departamento...</option>
                            {departments.map((dept) => (
                                <option key={dept.id} value={dept.id}>
                                    {dept.name}
                                </option>
                            ))}
                        </select>
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="city">Ciudad / Municipio</Label>
                        <select
                            id="city"
                            name="city"
                            required
                            value={selectedCity ? selectedCity.id : ""}
                            onChange={handleCityChange}
                            className="w-full h-12 bg-secondary/10 rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm px-3 border outline-none transition-colors disabled:opacity-50"
                            disabled={!selectedDepartment}
                        >
                            <option value="">Seleccione una ciudad...</option>
                            {cities.map((city) => (
                                <option key={city.id} value={city.id}>
                                    {city.name}
                                </option>
                            ))}
                        </select>
                    </div>
                </div>

                <div className="space-y-2">
                    <Label htmlFor="address">Dirección de Envío</Label>
                    <Input
                        type="text"
                        id="address"
                        name="address"
                        required
                        value={formData.address}
                        onChange={handleChange}
                        placeholder="Ej. Calle 123 # 45-67"
                        className="h-12 bg-secondary/10 border-gray-200 focus:border-primary focus:ring-primary"
                    />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                    <div className="space-y-2">
                        <Label htmlFor="detail">Detalle (Opcional)</Label>
                        <Input
                            type="text"
                            id="detail"
                            name="detail"
                            value={formData.detail}
                            onChange={handleChange}
                            placeholder="Apto, Unidad, Bloque, etc."
                            className="h-12 bg-secondary/10 border-gray-200 focus:border-primary focus:ring-primary"
                        />
                    </div>

                    <div className="space-y-2">
                        <Label htmlFor="instructions">Indicaciones (Opcional)</Label>
                        <Input
                            type="text"
                            id="instructions"
                            name="instructions"
                            value={formData.instructions}
                            onChange={handleChange}
                            placeholder="Dejar en portería, esquina azul..."
                            className="h-12 bg-secondary/10 border-gray-200 focus:border-primary focus:ring-primary"
                        />
                    </div>
                </div>
            </div>

            <div className="mt-10 border-t pt-8">
                <div className="flex justify-between items-center text-muted-foreground mb-3 text-sm">
                    <span>Subtotal de productos:</span>
                    <span>${cartTotal.toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground mb-6 text-sm">
                    <span>Costo de envío estimado:</span>
                    <span>${(shippingCost || 0).toLocaleString()}</span>
                </div>
                <div className="flex justify-between items-end text-2xl font-bold text-accent mb-8">
                    <span className="text-sm font-semibold uppercase tracking-wider text-primary">Total a Pagar</span>
                    <span>${(cartTotal + (shippingCost || 0)).toLocaleString()}</span>
                </div>
            </div>

            <div className="mb-6 flex items-start gap-3">
                <div className="flex items-center h-5 mt-1">
                    <input
                        id="terms-privacy"
                        name="terms-privacy"
                        type="checkbox"
                        checked={acceptTerms}
                        onChange={(e) => setAcceptTerms(e.target.checked)}
                        className="h-4 w-4 rounded border-border/50 text-accent focus:ring-accent outline-none cursor-pointer"
                    />
                </div>
                <div className="text-sm">
                    <Label htmlFor="terms-privacy" className="text-muted-foreground font-normal leading-relaxed cursor-pointer">
                        He leído y acepto los{' '}
                        <Link href="/legal/terminos-y-condiciones" className="font-semibold text-primary hover:text-accent underline transition-colors" target="_blank">
                            Términos y Condiciones
                        </Link>{' '}
                        y la{' '}
                        <Link href="/politicas/privacidad" className="font-semibold text-primary hover:text-accent underline transition-colors" target="_blank">
                            Política de Privacidad
                        </Link>.
                    </Label>
                </div>
            </div>

            <Button
                type="submit"
                size="lg"
                disabled={loadingPayment}
                className="w-full py-7 text-lg uppercase tracking-widest bg-primary text-secondary hover:bg-primary/90 transition-all shadow-xl"
            >
                {loadingPayment ? "Procesando de forma segura..." : "Realizar Pago"}
            </Button>
            <p className="text-xs text-center text-muted-foreground mt-4">Tus datos están protegidos y encriptados de forma segura.</p>
        </form>
    );
}

