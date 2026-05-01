"use client";

import { useState, useEffect, useMemo } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { useCart } from "@/context/CartContext";
import { useWompiPayment } from "@/hooks/useWompiPayment";
import { useBelvoPayment } from "@/hooks/useBelvoPayment";
import { useCheckout } from "@/hooks/useCheckout";
import { getDepartments, getCities, Department, City } from "@/services/locationApi";
import { getAuthHeaders } from "@/lib/auth";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Button } from "@/components/ui/button";
import CheckoutSummaryItem from "@/components/CheckoutSummaryItem";
import { Separator } from "@/components/ui/separator";
import { Truck, Store } from "lucide-react";

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

    // Discount Code
    const [discountCode, setDiscountCode] = useState("");
    const [appliedDiscount, setAppliedDiscount] = useState<{ code: string; percentage: number; freeShipping?: boolean } | null>(null);
    const [discountError, setDiscountError] = useState<string | null>(null);
    const [isApplyingDiscount, setIsApplyingDiscount] = useState(false);

    // Address management
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const [savedAddresses, setSavedAddresses] = useState<any[]>([]);
    const [selectedAddressId, setSelectedAddressId] = useState<string>("");

    // Payment Method
    const [paymentMethod, setPaymentMethod] = useState<"WOMPI_FULL" | "WOMPI_COD" | "BELVO_A2A">("WOMPI_FULL");

    // Delivery Method
    const [deliveryMethod, setDeliveryMethod] = useState<"SHIPPING" | "PICKUP">("SHIPPING");

    // Si el usuario está logueado, bloquear campos de identidad
    const [isLoggedIn, setIsLoggedIn] = useState(false);

    // Global calculations
    const globalDiscountAmount = appliedDiscount ? cartTotal * (appliedDiscount.percentage / 100) : 0;
    const globalFinalCartTotal = cartTotal - globalDiscountAmount;
    const isFreeShipping = globalFinalCartTotal >= 150000 || !!appliedDiscount?.freeShipping;

    // Reset COD if pickup selected or if free shipping applies
    useEffect(() => {
        if ((deliveryMethod === "PICKUP" || isFreeShipping) && paymentMethod === "WOMPI_COD") {
            setPaymentMethod("WOMPI_FULL");
        }
    }, [deliveryMethod, paymentMethod, isFreeShipping]);

    // GA4 Tracking: begin_checkout
    useEffect(() => {
        if (typeof window !== "undefined" && window.gtag && cartItems.length > 0) {
            window.gtag("event", "begin_checkout", {
                currency: "COP",
                value: cartTotal,
                items: cartItems.map((item) => ({
                    item_id: item.id.toString(),
                    item_name: item.name,
                    item_brand: "Two Six",
                    item_category: item.gender,
                    item_variant: `${item.clothingSize?.clothingColor?.color?.name} - ${item.clothingSize?.size?.name}`,
                    price: item.price,
                    quantity: item.quantity,
                })),
            });
        }
    }, [cartItems, cartTotal]);

    const [formData, setFormData] = useState({
        document_type: "13",
        document_number: "",
        name: "",
        email: "",
        phone: "",
        address: "",
        detail: "", // New field
        instructions: "", // New field
        city: "",
        department: "",
    });

    const formatPrice = (price: number) => {
        return new Intl.NumberFormat("es-CO", {
            style: "currency",
            currency: "COP",
            minimumFractionDigits: 0,
            maximumFractionDigits: 0,
        }).format(price);
    };

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await getDepartments();
                setDepartments(data);

                // Check for logged-in user
                const customerData = localStorage.getItem('customerData');
                if (customerData) {
                    const storedCustomer = JSON.parse(customerData);
                    setIsLoggedIn(true);

                    // CRIT-05: Cargar datos completos del cliente via API autenticada
                    // (localStorage solo tiene id, name, email)
                    let fullCustomer = storedCustomer;
                    try {
                        const customerResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/${storedCustomer.id}`, {
                            headers: { ...getAuthHeaders() },
                        });
                        if (customerResponse.ok) {
                            fullCustomer = await customerResponse.json();
                        }
                    } catch (e) {
                        console.error("Error fetching customer profile for checkout", e);
                    }

                    // Fetch saved addresses
                    try {
                        const addrResponse = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/address/customer/${storedCustomer.id}`, {
                            headers: { ...getAuthHeaders() },
                        });
                        if (addrResponse.ok) {
                            const addresses = await addrResponse.json();
                            setSavedAddresses(addresses);

                            // If there is a default address, use it
                            // eslint-disable-next-line @typescript-eslint/no-explicit-any
                            const defaultAddr = addresses.find((a: any) => a.is_default);
                            if (defaultAddr) {
                                setSelectedAddressId(defaultAddr.id.toString());
                                fillFormWithAddress(defaultAddr, fullCustomer, data);
                            } else {
                                // Fallback to customer profile data
                                prefillFromCustomer(fullCustomer, data);
                            }
                        } else {
                            // Fallback to customer profile data if address fetch fails
                            prefillFromCustomer(fullCustomer, data);
                        }
                    } catch (e) {
                        console.error("Error fetching addresses", e);
                        // Fallback to customer profile data
                        prefillFromCustomer(fullCustomer, data);
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
            document_type: customer.id_identification_type ? customer.id_identification_type.toString() : prev.document_type,
            document_number: customer.document_number || prev.document_number,
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

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const prefillFromCustomer = (customer: any, depts: Department[]) => {
        setFormData(prev => ({
            ...prev,
            document_type: customer.id_identification_type ? customer.id_identification_type.toString() : "13",
            document_number: customer.document_number || "",
            name: customer.name || "",
            email: customer.email || "",
            phone: customer.current_phone_number || "",
            address: customer.shipping_address || "",
            city: customer.city || "",
            department: customer.state || "",
        }));
        matchLocation(customer.state, customer.city, depts);
    };

    const handleAddressSelection = async (e: React.ChangeEvent<HTMLSelectElement>) => {
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
                // Cargar datos del cliente via API (localStorage solo tiene datos mínimos)
                const storedData = localStorage.getItem('customerData');
                let customer = storedData ? JSON.parse(storedData) : {};
                try {
                    const resp = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/customer/${customer.id}`, {
                        headers: { ...getAuthHeaders() },
                    });
                    if (resp.ok) customer = await resp.json();
                } catch { /* use minimal data as fallback */ }
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

    const { createOrder, isProcessingCheckout } = useCheckout();
    const { startWompiFlow, loadingPayment } = useWompiPayment(paymentHandlers);
    const { startBelvoFlow, isStartingBelvo } = useBelvoPayment({
        onSuccess: (ref) => {
            // Cuando Belvo tenga un flujo completo:
            // router.push(`/checkout/success?orderId=${ref}`);
        },
        onError: (msg) => setError(msg)
    });

    const isProcessing = isProcessingCheckout || loadingPayment || isStartingBelvo;

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

    const handleApplyDiscount = async () => {
        setDiscountError(null);
        if (!discountCode.trim()) {
            setDiscountError("Ingresa un código");
            return;
        }
        if (!formData.email) {
            setDiscountError("Ingresa tu correo antes de aplicar el descuento");
            return;
        }

        setIsApplyingDiscount(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/validate-discount`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({ 
                    code: discountCode, 
                    email: formData.email,
                    cartTotal: cartTotal,
                    itemCount: cartItems.reduce((acc, item) => acc + item.quantity, 0)
                }),
            });
            const data = await response.json();

            if (!response.ok) {
                setDiscountError(data.message || "Código inválido");
                setAppliedDiscount(null);
            } else {
                setAppliedDiscount({ code: data.code, percentage: data.percentage, freeShipping: data.freeShipping });
            }
        } catch (error) {
            setDiscountError("Error al verificar el código");
        } finally {
            setIsApplyingDiscount(false);
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!acceptTerms) {
            setError("Debes aceptar los Términos y Condiciones y la Política de Privacidad para continuar con el pago.");
            return;
        }

        const discountAmount = appliedDiscount ? cartTotal * (appliedDiscount.percentage / 100) : 0;
        const finalCartTotal = cartTotal - discountAmount;
        const isFreeShipping = finalCartTotal >= 150000 || !!appliedDiscount?.freeShipping;
        const effectiveShippingCost = (deliveryMethod === "PICKUP" || isFreeShipping) ? 0 : (shippingCost || 0);
        
        const totalWithShipping = finalCartTotal + effectiveShippingCost;

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
            shippingCost: effectiveShippingCost,
            discountCode: appliedDiscount?.code,
            paymentMethod: paymentMethod,
            deliveryMethod: deliveryMethod,
        };

        try {
            const data = await createOrder(checkoutData);

            if (data.wompi) {
                await startWompiFlow(data.wompi);
            } else if (data.belvo) {
                await startBelvoFlow(data.belvo);
            } else {
                setError("No se recibieron datos de la pasarela de pagos.");
            }
        } catch (error: any) {
            setError(error.message || "Error al procesar la orden.");
        }
    };

    if (itemCount === 0) {
        return null;
    }

    return (
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12">
            {/* Columna Izquierda: Formulario */}
            <div className="lg:col-span-7">
                <form onSubmit={handleSubmit} className="bg-white p-8 rounded-2xl shadow-sm border border-border">
                    <h2 className="text-2xl font-serif font-bold text-primary mb-6 tracking-tight">Método de Entrega</h2>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-8">
                        {/* Envío a Domicilio */}
                        <label
                            className={`relative flex cursor-pointer rounded-xl border p-5 shadow-sm focus:outline-none transition-all duration-300 ${deliveryMethod === "SHIPPING" ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border bg-white hover:border-gray-300 hover:shadow-md"}`}
                        >
                            <input
                                type="radio"
                                name="delivery_method"
                                value="SHIPPING"
                                className="sr-only"
                                checked={deliveryMethod === "SHIPPING"}
                                onChange={() => setDeliveryMethod("SHIPPING")}
                            />
                            <div className="flex flex-1 items-start justify-between gap-4">
                                <div className="flex flex-col">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${deliveryMethod === "SHIPPING" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                                            <Truck className="w-5 h-5" />
                                        </div>
                                        <span className={`block text-base font-bold ${deliveryMethod === "SHIPPING" ? "text-primary" : "text-gray-900"}`}>
                                            Envío Nacional/Local
                                        </span>
                                    </div>
                                    <span className="text-sm text-gray-500 leading-relaxed pl-11">
                                        Recibe tu pedido a través de transportadora en tu hogar u oficina.
                                    </span>
                                </div>
                                <div className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${deliveryMethod === "SHIPPING" ? "border-primary bg-primary text-white" : "border-gray-300 bg-white"}`}>
                                    {deliveryMethod === "SHIPPING" && (
                                        <svg className="h-3 w-3 fill-current" viewBox="0 0 12 12"><path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" /></svg>
                                    )}
                                </div>
                            </div>
                        </label>

                        {/* Recoger en Punto */}
                        <label
                            className={`relative flex cursor-pointer rounded-xl border p-5 shadow-sm focus:outline-none transition-all duration-300 ${deliveryMethod === "PICKUP" ? "border-primary ring-1 ring-primary bg-primary/5" : "border-border bg-white hover:border-gray-300 hover:shadow-md"}`}
                        >
                            <input
                                type="radio"
                                name="delivery_method"
                                value="PICKUP"
                                className="sr-only"
                                checked={deliveryMethod === "PICKUP"}
                                onChange={() => {
                                    setDeliveryMethod("PICKUP");
                                    setShippingCost(0);
                                }}
                            />
                            <div className="flex flex-1 items-start justify-between gap-4">
                                <div className="flex flex-col w-full">
                                    <div className="flex items-center gap-3 mb-2">
                                        <div className={`p-2 rounded-lg ${deliveryMethod === "PICKUP" ? "bg-primary text-white" : "bg-gray-100 text-gray-500"}`}>
                                            <Store className="w-5 h-5" />
                                        </div>
                                        <div className="flex items-center flex-wrap gap-2">
                                            <span className={`block text-base font-bold ${deliveryMethod === "PICKUP" ? "text-primary" : "text-gray-900"}`}>
                                                Recoger en Punto
                                            </span>
                                            <span className="px-2 py-0.5 bg-green-100 text-green-700 border border-green-200 rounded-full text-[10.5px] uppercase tracking-wider font-extrabold shadow-sm">
                                                Gratis
                                            </span>
                                        </div>
                                    </div>
                                    <span className="text-sm text-gray-500 leading-relaxed pl-11">
                                        Retira tu pedido sin costo en nuestro punto en Envigado, Ant.
                                    </span>
                                </div>
                                <div className={`mt-1 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${deliveryMethod === "PICKUP" ? "border-primary bg-primary text-white" : "border-gray-300 bg-white"}`}>
                                    {deliveryMethod === "PICKUP" && (
                                        <svg className="h-3 w-3 fill-current" viewBox="0 0 12 12"><path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" /></svg>
                                    )}
                                </div>
                            </div>
                        </label>
                    </div>

                    {deliveryMethod === "PICKUP" && (
                        <div className="mb-8 p-6 bg-primary/5 border border-primary/20 rounded-xl animate-in fade-in slide-in-from-top-4 duration-500">
                            <h3 className="text-lg font-serif font-semibold text-primary mb-2 flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary" fill="none" viewBox="0 0 24 24" stroke="currentColor"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M17.657 16.657L13.414 20.9a1.998 1.998 0 01-2.827 0l-4.244-4.243a8 8 0 1111.314 0z" /><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 11a3 3 0 11-6 0 3 3 0 016 0z" /></svg>
                                Punto de Retiro Two Six
                            </h3>
                            <p className="text-sm text-gray-700 mb-4 line-height-relaxed">
                                <strong>Dirección:</strong> CL 36D SUR #27D-39, APTO 1001, URB Guadalcanal Apartamentos, Envigado, Antioquia.<br />
                            </p>

                            <div className="w-full h-[250px] rounded-lg overflow-hidden border border-gray-200 shadow-inner mb-4">
                                <iframe
                                    title="Punto de Retiro Two Six"
                                    src="https://maps.google.com/maps?q=6%C2%B009'53.0%22N%2075%C2%B034'32.0%22W&t=&z=16&ie=UTF8&iwloc=&output=embed"
                                    width="100%"
                                    height="100%"
                                    style={{ border: 0 }}
                                    allowFullScreen
                                    loading="lazy"
                                ></iframe>
                            </div>

                            <div className="bg-white p-4 rounded-lg border border-gray-100/50 text-sm text-gray-600">
                                <p className="font-medium text-amber-600 mb-1">⚠️ Importante:</p>
                                <p>Este punto es exclusivo para la recolección de pedidos previamente pagados. <strong>No disponemos de probadores ni sala de exhibición de prendas.</strong></p>
                                <p className="mt-2 text-primary font-medium">🕒 Estará disponible 4 horas hábiles después de tu compra.</p>
                            </div>
                        </div>
                    )}

                    <h2 className="text-2xl font-serif font-bold text-primary mb-8 tracking-tight">Datos de Contacto</h2>

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

                    {deliveryMethod === "SHIPPING" && savedAddresses.length > 0 && (
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
                                <Label htmlFor="document_type">Tipo de Documento</Label>
                                <select
                                    id="document_type"
                                    name="document_type"
                                    required
                                    value={formData.document_type}
                                    onChange={handleChange}
                                    disabled={isLoggedIn}
                                    className={`w-full h-12 bg-secondary/10 rounded-lg border-gray-200 focus:border-primary focus:ring-primary text-sm px-3 border outline-none transition-colors ${isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
                                >
                                    <option value="13">Cédula de Ciudadanía (CC)</option>
                                    <option value="22">Cédula de Extranjería (CE)</option>
                                    <option value="31">NIT</option>
                                    <option value="42">Documento Extranjero</option>
                                    <option value="50">NIT de otro país</option>
                                    <option value="91">NUIP (Menores)</option>
                                    <option value="47">PEP</option>
                                </select>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="document_number">Número de Documento</Label>
                                <Input
                                    type="text"
                                    id="document_number"
                                    name="document_number"
                                    required
                                    value={formData.document_number}
                                    onChange={handleChange}
                                    disabled={isLoggedIn}
                                    className={`h-12 bg-secondary/10 border-gray-200 focus:border-primary focus:ring-primary ${isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
                                    placeholder="Sin puntos ni espacios"
                                />
                                <p className="text-xs text-muted-foreground mt-1.5 flex items-start gap-1.5 line-height-relaxed">
                                    <svg xmlns="http://www.w3.org/2000/svg" className="h-3.5 w-3.5 text-primary shrink-0 mt-0.5" viewBox="0 0 20 20" fill="currentColor">
                                        <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                                    </svg>
                                    Esta información será utilizada de forma segura para generar tu Factura Electrónica de la DIAN a tu correo.
                                </p>
                            </div>
                        </div>

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
                                disabled={isLoggedIn}
                                className={`h-12 bg-secondary/10 border-gray-200 focus:border-primary focus:ring-primary ${isLoggedIn ? 'opacity-60 cursor-not-allowed' : ''}`}
                            />
                        </div>

                        {deliveryMethod === "SHIPPING" && (
                            <>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 pt-4 border-t border-border mt-6">
                                    <div className="space-y-2">
                                        <Label htmlFor="department">Departamento</Label>
                                        <select
                                            id="department"
                                            name="department"
                                            required={deliveryMethod === "SHIPPING"}
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
                                            required={deliveryMethod === "SHIPPING"}
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
                                        required={deliveryMethod === "SHIPPING"}
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
                            </>
                        )}
                    </div>

                    {/* Discount Code Section */}
                    <div className="mt-8 border-t pt-8">
                        <Label htmlFor="discountCode" className="block mb-2 font-medium">¿Tienes un código de descuento?</Label>
                        <div className="flex gap-3">
                            <Input
                                type="text"
                                id="discountCode"
                                placeholder="Ingresa tu código"
                                value={discountCode}
                                onChange={(e) => setDiscountCode(e.target.value.toUpperCase())}
                                className="h-12 uppercase bg-secondary/10 border-gray-200 focus:border-primary focus:ring-primary"
                                disabled={!!appliedDiscount || isApplyingDiscount}
                            />
                            <Button
                                type="button"
                                variant={appliedDiscount ? "outline" : "default"}
                                onClick={appliedDiscount ? () => { setAppliedDiscount(null); setDiscountCode(""); } : handleApplyDiscount}
                                disabled={isApplyingDiscount}
                                className={`h-12 px-6 ${appliedDiscount ? 'border-primary text-primary hover:bg-red-50 hover:text-red-600 hover:border-red-200' : 'bg-primary text-secondary hover:bg-primary/90'}`}
                            >
                                {isApplyingDiscount ? "Validando..." : appliedDiscount ? "Quitar" : "Aplicar"}
                            </Button>
                        </div>
                        {discountError && <p className="text-sm text-destructive mt-2">{discountError}</p>}
                        {appliedDiscount && <p className="text-sm text-green-600 mt-2 font-medium">¡Código {appliedDiscount.code} aplicado! {appliedDiscount.percentage > 0 ? `(-${appliedDiscount.percentage}%)` : ''}{appliedDiscount.freeShipping ? ' + Envío Gratis' : ''}</p>}
                    </div>

                    <div className="mt-8 border-t pt-8">
                        <Label className="block mb-4 font-serif font-bold text-primary text-xl">Método de Pago</Label>
                        <div className="space-y-4">
                            {/* Standard Online Payment */}
                            <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none transition-all duration-300 ${paymentMethod === 'WOMPI_FULL' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="WOMPI_FULL"
                                    className="sr-only"
                                    checked={paymentMethod === 'WOMPI_FULL'}
                                    onChange={() => setPaymentMethod('WOMPI_FULL')}
                                />
                                <span className="flex flex-1">
                                    <span className="flex flex-col">
                                        <span className={`block text-sm font-medium ${paymentMethod === 'WOMPI_FULL' ? 'text-primary' : 'text-gray-900'}`}>
                                            Pago en Línea Completo
                                            {process.env.NEXT_PUBLIC_WOMPI_SOLO_TARJETAS_CREDITO === 'true' && (
                                                <span className="ml-2 text-[10px] uppercase tracking-wider bg-gray-200 text-gray-700 px-2 py-0.5 rounded">Solo Tarjetas de Crédito</span>
                                            )}
                                        </span>
                                        <span className="mt-1 flex items-center text-sm text-gray-500">Paga el total del pedido de forma segura a través de Wompi.</span>
                                    </span>
                                </span>
                                <div className={`mt-2 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'WOMPI_FULL' ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'}`}>
                                    {paymentMethod === 'WOMPI_FULL' && (
                                        <svg className="h-3 w-3 fill-current" viewBox="0 0 12 12"><path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" /></svg>
                                    )}
                                </div>
                            </label>

                            {/* Belvo Open Banking */}
                            <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none transition-all duration-300 ${paymentMethod === 'BELVO_A2A' ? 'border-primary ring-1 ring-primary bg-primary/5' : 'border-gray-300 hover:border-gray-400'}`}>
                                <input
                                    type="radio"
                                    name="payment_method"
                                    value="BELVO_A2A"
                                    className="sr-only"
                                    checked={paymentMethod === 'BELVO_A2A'}
                                    onChange={() => setPaymentMethod('BELVO_A2A')}
                                />
                                <span className="flex flex-1">
                                    <span className="flex flex-col">
                                        <span className={`block text-sm font-medium flex items-center gap-2 ${paymentMethod === 'BELVO_A2A' ? 'text-primary' : 'text-gray-900'}`}>
                                            Transferencia Bancaria Directa (PSE/Open Banking)
                                            <span className="px-2 py-0.5 bg-blue-100 text-blue-700 border border-blue-200 rounded-full text-[10px] uppercase tracking-wider font-bold">Recomendado</span>
                                        </span>
                                        <span className="mt-1 flex items-center text-sm text-gray-500">Paga de forma rápida y segura directamente desde la app de tu banco usando Belvo.</span>
                                    </span>
                                </span>
                                <div className={`mt-2 h-5 w-5 rounded-full border flex items-center justify-center shrink-0 transition-colors ${paymentMethod === 'BELVO_A2A' ? 'border-primary bg-primary text-white' : 'border-gray-300 bg-white'}`}>
                                    {paymentMethod === 'BELVO_A2A' && (
                                        <svg className="h-3 w-3 fill-current" viewBox="0 0 12 12"><path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" /></svg>
                                    )}
                                </div>
                            </label>

                            {deliveryMethod === "SHIPPING" && !isFreeShipping && (
                                <label className={`relative flex cursor-pointer rounded-lg border bg-white p-4 shadow-sm focus:outline-none ${paymentMethod === 'WOMPI_COD' ? 'border-amber-500 ring-1 ring-amber-500 bg-amber-50/50' : 'border-gray-300'}`}>
                                    {/* Cash on Delivery */}
                                    <input
                                        type="radio"
                                        name="payment_method"
                                        value="WOMPI_COD"
                                        className="sr-only"
                                        checked={paymentMethod === 'WOMPI_COD'}
                                        onChange={() => setPaymentMethod('WOMPI_COD')}
                                    />
                                    <span className="flex flex-1">
                                        <span className="flex flex-col">
                                            <span className="block text-sm font-medium text-amber-900">Pago Contra Entrega (Solo Envío Web)</span>
                                            <span className="mt-1 flex items-center text-sm text-amber-700">Pagas solo el envío hoy, y el valor de las prendas en efectivo a la transportadora.</span>
                                        </span>
                                    </span>
                                    <div className={`mt-2 h-5 w-5 rounded-full border flex items-center justify-center ${paymentMethod === 'WOMPI_COD' ? 'border-amber-500 bg-amber-500 text-white' : 'border-gray-300 bg-white'}`}>
                                        {paymentMethod === 'WOMPI_COD' && (
                                            <svg className="h-3 w-3 fill-current" viewBox="0 0 12 12"><path d="M3.707 5.293a1 1 0 00-1.414 1.414l1.414-1.414zM5 8l-.707.707a1 1 0 001.414 0L5 8zm4.707-3.293a1 1 0 00-1.414-1.414l1.414 1.414zm-7.414 2l2 2 1.414-1.414-2-2-1.414 1.414zm3.414 2l4-4-1.414-1.414-4 4 1.414 1.414z" /></svg>
                                        )}
                                    </div>
                                </label>
                            )}
                        </div>
                    </div>

                <div className="mt-8 border-t pt-8">
                    <div className="flex justify-between items-center text-muted-foreground mb-3 text-sm">
                        <span>Subtotal de productos:</span>
                        <span className={appliedDiscount ? "line-through text-gray-400" : ""}>${cartTotal.toLocaleString()}</span>
                    </div>
                    {paymentMethod === 'WOMPI_COD' && (
                        <div className="flex justify-between items-center text-amber-600 mb-3 text-sm font-medium">
                            <span>A Pagar Contra Entrega (PCE):</span>
                            <span>${(cartTotal - (appliedDiscount ? cartTotal * (appliedDiscount.percentage / 100) : 0)).toLocaleString()}</span>
                        </div>
                    )}
                    {appliedDiscount && (() => {
                        const discountAmount = cartTotal * (appliedDiscount.percentage / 100);
                        return (
                            <div className="flex justify-between items-center text-green-600 mb-3 text-sm font-medium">
                                <span>Descuento ({appliedDiscount.percentage}%):</span>
                                <span>-${discountAmount.toLocaleString()}</span>
                            </div>
                        );
                    })()}
                    <div className="flex justify-between items-center text-muted-foreground mb-6 text-sm">
                        <span>Costo de envío estimado:</span>
                        {(() => {
                            const discountAmount = appliedDiscount ? cartTotal * (appliedDiscount.percentage / 100) : 0;
                            const finalCartTotal = cartTotal - discountAmount;
                            const isFreeShipping = finalCartTotal >= 150000 || !!appliedDiscount?.freeShipping;
                            const rawShip = shippingCost || 0;
                            
                            if (deliveryMethod === "PICKUP") {
                                return <span>$0</span>;
                            }
                            if (isFreeShipping) {
                                return (
                                    <div className="flex items-center gap-2">
                                        <span className="line-through text-gray-400">${rawShip.toLocaleString()}</span>
                                        <span className="text-green-600 font-bold uppercase text-[11.5px] tracking-widest bg-green-50 px-2.5 py-0.5 rounded-full border border-green-200 shadow-sm">¡Envío Gratis!</span>
                                    </div>
                                );
                            }
                            return <span>${rawShip.toLocaleString()}</span>;
                        })()}
                    </div>
                    <div className="flex justify-between items-end text-2xl font-bold text-accent mb-8">
                        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Total a Pagar Hoy</span>
                        {(() => {
                            const discountAmount = appliedDiscount ? cartTotal * (appliedDiscount.percentage / 100) : 0;
                            const finalCartTotal = cartTotal - discountAmount;
                            const isFreeShipping = finalCartTotal >= 150000 || !!appliedDiscount?.freeShipping;
                            const effectiveShippingCost = (deliveryMethod === "PICKUP" || isFreeShipping) ? 0 : (shippingCost || 0);

                            const totalWithShipping = paymentMethod === 'WOMPI_COD' ? effectiveShippingCost : (finalCartTotal + effectiveShippingCost);
                            return <span>${totalWithShipping.toLocaleString()}</span>;
                        })()}
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

                    <div className="bg-primary/5 border border-primary/10 rounded-xl p-4 mb-6 flex items-start gap-3 shadow-sm">
                        <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5 text-primary shrink-0 mt-0.5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9 12h6m-6 4h6m2 5H7a2 2 0 01-2-2V5a2 2 0 012-2h5.586a1 1 0 01.707.293l5.414 5.414a1 1 0 01.293.707V19a2 2 0 01-2 2z" />
                        </svg>
                        <p className="text-sm text-primary/80 leading-relaxed font-medium">
                            Al continuar con el pago, aceptas la emisión de una Factura Electrónica de la DIAN a tu nombre con los datos ingresados.
                        </p>
                    </div>

                    <Button
                        type="submit"
                        size="lg"
                        disabled={isProcessing}
                        className="w-full py-7 text-lg uppercase tracking-widest bg-primary text-secondary hover:bg-primary/90 transition-all shadow-xl"
                    >
                        {isProcessing ? "Procesando de forma segura..." : "Realizar Pago"}
                    </Button>
                    <p className="text-xs text-center text-muted-foreground mt-4">Tus datos están protegidos y encriptados de forma segura.</p>
                </form>
            </div>

            {/* Columna Derecha: Resumen del Pedido */}
            <div className="lg:col-span-5">
                <div className="bg-white p-8 rounded-2xl shadow-sm border border-border sticky top-32">
                    <h2 className="text-xl font-serif font-bold text-primary mb-6">Resumen del Pedido</h2>

                    <div className="space-y-4 mb-6 max-h-96 overflow-y-auto pr-2 custom-scrollbar">
                        {cartItems.map((item) => (
                            <div key={item.id} className="mb-4">
                                <CheckoutSummaryItem
                                    item={item}
                                    formatPrice={formatPrice}
                                />
                            </div>
                        ))}
                    </div>

                    <Separator className="my-6" />

                    <div className="space-y-4 text-sm mb-6">
                        <div className="flex justify-between items-center text-muted-foreground">
                            <span>Subtotal</span>
                            <span className={appliedDiscount ? "line-through text-gray-400 font-medium" : "font-medium text-primary"}>{formatPrice(cartTotal)}</span>
                        </div>

                        {appliedDiscount && (() => {
                            const discountAmount = cartTotal * (appliedDiscount.percentage / 100);
                            return (
                                <div className="flex justify-between items-center text-green-600 font-medium">
                                    <span>Descuento ({appliedDiscount.percentage}%):</span>
                                    <span>-{formatPrice(discountAmount)}</span>
                                </div>
                            );
                        })()}

                        <div className="flex justify-between items-center text-muted-foreground">
                            <span>Envío</span>
                            {(() => {
                                const rawShip = shippingCost || 0;
                                if (deliveryMethod === "PICKUP") {
                                    return <span className="font-medium text-primary">$0</span>;
                                }
                                if (isFreeShipping) {
                                    return (
                                        <div className="flex items-center gap-2">
                                            <span className="line-through text-gray-400">{formatPrice(rawShip)}</span>
                                            <span className="text-green-600 font-bold uppercase text-[11px] tracking-wider bg-green-50 px-2 py-0.5 rounded-full">¡Envío Gratis!</span>
                                        </div>
                                    );
                                }
                                return <span className="font-medium text-primary">{shippingCost > 0 ? formatPrice(shippingCost) : <span className="text-xs uppercase tracking-wider">Calculado en el siguiente paso</span>}</span>;
                            })()}
                        </div>

                        {paymentMethod === 'WOMPI_COD' && (
                            <div className="flex justify-between items-center text-amber-600 font-medium">
                                <span>A Pagar Contra Entrega (PCE)</span>
                                <span>{formatPrice(cartTotal - (appliedDiscount ? cartTotal * (appliedDiscount.percentage / 100) : 0))}</span>
                            </div>
                        )}
                    </div>

                    <Separator className="my-6" />

                    <div className="flex justify-between items-end mb-2">
                        <span className="text-sm font-semibold uppercase tracking-wider text-primary">Total a Pagar Hoy</span>
                        <span className="text-2xl font-bold text-accent">
                            {(() => {
                                const effectiveShippingCost = (deliveryMethod === "PICKUP" || isFreeShipping) ? 0 : (shippingCost || 0);
                                const totalWithShipping = paymentMethod === 'WOMPI_COD' ? effectiveShippingCost : (globalFinalCartTotal + effectiveShippingCost);
                                return formatPrice(totalWithShipping);
                            })()}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}

