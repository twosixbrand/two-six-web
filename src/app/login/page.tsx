'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { getDepartments, getCities, Department, City } from "@/services/locationApi";
import { Label } from "@/components/ui/label";

const ID_TYPES = [
    { id: 1, name: 'Cédula de Ciudadanía', code: 'CC' },
    { id: 3, name: 'Cédula de Extranjería', code: 'CE' },
    { id: 4, name: 'Pasaporte', code: 'PAS' },
    { id: 2, name: 'NIT', code: 'NIT' },
    { id: 5, name: 'Tarjeta de Identidad', code: 'TI' },
];

export default function LoginPage() {
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState('');
    const router = useRouter();

    // Registration States
    const [showRegistration, setShowRegistration] = useState(false);
    const [departments, setDepartments] = useState<Department[]>([]);
    const [cities, setCities] = useState<City[]>([]);
    const [loadingLocations, setLoadingLocations] = useState(true);

    const [formData, setFormData] = useState({
        document_number: "",
        id_identification_type: 1,
        name: "",
        phone: "",
        address: "",
        city: "",
        department: "",
    });
    const [selectedDepartment, setSelectedDepartment] = useState<Department | null>(null);
    const [selectedCity, setSelectedCity] = useState<City | null>(null);
    const [acceptPrivacy, setAcceptPrivacy] = useState(false);

    useEffect(() => {
        const fetchDepartments = async () => {
            try {
                const data = await getDepartments();
                setDepartments(data);
            } catch {
                console.error("Error al cargar los departamentos.");
            } finally {
                setLoadingLocations(false);
            }
        };
        fetchDepartments();
    }, []);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value } = e.target;
        setFormData((prev) => ({ ...prev, [name]: value }));
    };

    const handleDepartmentChange = async (e: React.ChangeEvent<HTMLSelectElement>) => {
        const departmentId = parseInt(e.target.value);
        const department = departments.find((d) => d.id === departmentId);
        setSelectedDepartment(department || null);
        setSelectedCity(null);
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
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setLoading(true);
        setError('');

        if (showRegistration) {
            if (!acceptPrivacy) {
                setError('Debes autorizar el tratamiento de datos aceptando la Política de Privacidad para continuar.');
                setLoading(false);
                return;
            }

            if (!formData.document_number.trim()) {
                setError('El número de documento es obligatorio.');
                setLoading(false);
                return;
            }

            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/customer/register`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({
                        email: email.trim(),
                        document_number: formData.document_number.trim(),
                        id_identification_type: Number(formData.id_identification_type),
                        name: formData.name.trim(),
                        phone: formData.phone.trim(),
                        address: formData.address.trim(),
                        department: formData.department,
                        city: formData.city,
                    }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    throw new Error(data.message || 'Error al registrar tu cuenta');
                }

                sessionStorage.setItem('pendingOtpEmail', email.trim());
                router.push(`/login/otp?email=${encodeURIComponent(email.trim())}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError(err.message || 'Ocurrió un error inesperado al registrar.');
            } finally {
                setLoading(false);
            }
        } else {
            try {
                const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/auth/customer/login`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ email: email.trim() }),
                });

                if (!response.ok) {
                    const data = await response.json();
                    if (response.status === 404 || (data.message && data.message.includes('no encontramos'))) {
                        setShowRegistration(true);
                        setError('No tienes una cuenta aún. Completa tus datos para registrarte.');
                        setLoading(false);
                        return;
                    }
                    throw new Error(data.message || 'Error al iniciar sesión');
                }

                sessionStorage.setItem('pendingOtpEmail', email.trim());
                router.push(`/login/otp?email=${encodeURIComponent(email.trim())}`);
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            } catch (err: any) {
                setError(err.message || 'Ocurrió un error inesperado al iniciar sesión.');
            } finally {
                setLoading(false);
            }
        }
    };

    return (
        <div className="min-h-screen flex items-center justify-center bg-secondary/20 py-12 px-4 sm:px-6 lg:px-8 relative overflow-hidden">
            <div className="absolute top-[-10%] left-[-10%] w-[40%] h-[40%] bg-primary/5 rounded-full blur-3xl pointer-events-none"></div>
            <div className="absolute bottom-[-10%] right-[-10%] w-[40%] h-[40%] bg-accent/5 rounded-full blur-3xl pointer-events-none"></div>

            <div className={`${showRegistration ? 'max-w-2xl' : 'max-w-md'} w-full space-y-8 bg-white/80 backdrop-blur-xl p-10 rounded-3xl shadow-2xl border border-white/20 relative z-10 transition-all duration-500 hover:shadow-accent/10`}>
                <div className="text-center">
                    <h2 className="text-4xl font-serif font-bold tracking-tight text-primary">
                        {showRegistration ? 'Completa tu Registro' : 'Bienvenido'}
                    </h2>
                    <p className="mt-3 text-sm text-muted-foreground">
                        {showRegistration
                            ? 'Necesitamos tus datos para la facturación electrónica y envíos.'
                            : 'Ingresa tu correo electrónico para recibir un código de acceso.'}
                    </p>
                </div>

                <form onSubmit={handleSubmit} className="mt-10 space-y-6">
                    <div>
                        <label htmlFor="email" className="sr-only">Correo Electrónico</label>
                        <div className="relative">
                            <input
                                id="email"
                                name="email"
                                type="email"
                                required
                                disabled={showRegistration}
                                className={`block w-full h-14 pl-5 pr-12 rounded-xl bg-white/50 border border-border focus:border-accent focus:ring-1 focus:ring-accent transition-all text-primary placeholder:text-muted-foreground outline-none ${showRegistration ? 'opacity-60 cursor-not-allowed bg-secondary/20' : ''}`}
                                placeholder="Tu Correo Electrónico"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                            />
                            <div className="absolute inset-y-0 right-0 pr-4 flex items-center pointer-events-none text-muted-foreground">
                                <svg xmlns="http://www.w3.org/2000/svg" className="h-5 w-5" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                                </svg>
                            </div>
                        </div>
                    </div>

                    {showRegistration && (
                        <div className="space-y-6 animate-in fade-in slide-in-from-top-4 duration-500 pt-4 border-t border-border">
                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2 col-span-1 md:col-span-2">
                                    <Label htmlFor="name" className="text-sm font-semibold text-primary">Nombre Completo *</Label>
                                    <input
                                        type="text"
                                        id="name"
                                        name="name"
                                        required
                                        value={formData.name}
                                        onChange={handleChange}
                                        placeholder="Nombre y Apellido"
                                        className="w-full h-12 bg-white/50 rounded-xl border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="id_identification_type" className="text-sm font-semibold text-primary">Tipo de Documento *</Label>
                                    <select
                                        id="id_identification_type"
                                        name="id_identification_type"
                                        required
                                        value={formData.id_identification_type}
                                        onChange={handleChange}
                                        className="w-full h-12 bg-white/50 rounded-xl border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 transition-all text-sm"
                                    >
                                        {ID_TYPES.map((type) => (
                                            <option key={type.id} value={type.id}>
                                                {type.code} - {type.name}
                                            </option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="document_number" className="text-sm font-semibold text-primary">Número de Documento *</Label>
                                    <input
                                        type="text"
                                        id="document_number"
                                        name="document_number"
                                        required
                                        value={formData.document_number}
                                        onChange={handleChange}
                                        placeholder="Sin puntos ni guiones"
                                        className="w-full h-12 bg-white/50 rounded-xl border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 transition-all"
                                    />
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="phone" className="text-sm font-semibold text-primary">Teléfono *</Label>
                                    <input
                                        type="tel"
                                        id="phone"
                                        name="phone"
                                        required
                                        value={formData.phone}
                                        onChange={handleChange}
                                        placeholder="Ej. 3101234567"
                                        className="w-full h-12 bg-white/50 rounded-xl border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 transition-all"
                                    />
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                <div className="space-y-2">
                                    <Label htmlFor="department" className="text-sm font-semibold text-primary">Departamento</Label>
                                    <select
                                        id="department"
                                        name="department"
                                        value={selectedDepartment ? selectedDepartment.id : ""}
                                        onChange={handleDepartmentChange}
                                        className="w-full h-12 bg-white/50 rounded-xl border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 transition-all text-sm"
                                        disabled={loadingLocations}
                                    >
                                        <option value="">Seleccione un departamento...</option>
                                        {departments.map((dept) => (
                                            <option key={dept.id} value={dept.id}>{dept.name}</option>
                                        ))}
                                    </select>
                                </div>

                                <div className="space-y-2">
                                    <Label htmlFor="city" className="text-sm font-semibold text-primary">Ciudad / Municipio</Label>
                                    <select
                                        id="city"
                                        name="city"
                                        value={selectedCity ? selectedCity.id : ""}
                                        onChange={handleCityChange}
                                        className="w-full h-12 bg-white/50 rounded-xl border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 transition-all text-sm disabled:opacity-50"
                                        disabled={!selectedDepartment}
                                    >
                                        <option value="">Seleccione una ciudad...</option>
                                        {cities.map((city) => (
                                            <option key={city.id} value={city.id}>{city.name}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>

                            <div className="space-y-2">
                                <Label htmlFor="address" className="text-sm font-semibold text-primary">Dirección Principal</Label>
                                <input
                                    type="text"
                                    id="address"
                                    name="address"
                                    value={formData.address}
                                    onChange={handleChange}
                                    placeholder="Ej. Calle 123 # 45-67 Barrio X"
                                    className="w-full h-12 bg-white/50 rounded-xl border border-border focus:border-accent focus:ring-1 focus:ring-accent outline-none px-4 transition-all"
                                />
                            </div>

                            <div className="flex items-start gap-3 pt-2">
                                <div className="flex items-center h-5 mt-1">
                                    <input
                                        id="privacy-policy"
                                        name="privacy-policy"
                                        type="checkbox"
                                        checked={acceptPrivacy}
                                        onChange={(e) => setAcceptPrivacy(e.target.checked)}
                                        className="h-4 w-4 rounded border-border/50 text-accent focus:ring-accent outline-none cursor-pointer"
                                    />
                                </div>
                                <div className="text-sm">
                                    <Label htmlFor="privacy-policy" className="text-muted-foreground font-normal leading-relaxed cursor-pointer">
                                        Autorizo el tratamiento de mis datos personales según la{' '}
                                        <Link href="/politicas/privacidad" className="font-semibold text-primary hover:text-accent underline transition-colors" target="_blank">
                                            Política de Privacidad
                                        </Link>.
                                    </Label>
                                </div>
                            </div>
                        </div>
                    )}

                    {error && (
                        <div className={`p-3 text-sm text-center rounded-lg animate-in fade-in zoom-in duration-300 ${showRegistration ? 'text-primary bg-accent/10 border border-accent/20' : 'text-destructive bg-destructive/10 border border-destructive/20'}`}>
                            {error}
                        </div>
                    )}

                    <div className="pt-2">
                        <button
                            type="submit"
                            disabled={loading}
                            className="w-full flex justify-center items-center py-4 px-4 border border-transparent rounded-xl shadow-lg text-sm font-bold tracking-wider uppercase text-white bg-primary hover:bg-primary/90 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-primary disabled:opacity-50 disabled:cursor-not-allowed transition-all"
                        >
                            {loading ? (
                                <span className="flex items-center gap-2">
                                    <div className="w-4 h-4 rounded-full border-2 border-white/30 border-t-white animate-spin"></div>
                                    Procesando...
                                </span>
                            ) : (
                                showRegistration ? 'Crear Cuenta y Enviar Código' : 'Enviar Código de Acceso'
                            )}
                        </button>
                    </div>
                </form>

                {showRegistration && (
                    <div className="text-center">
                        <button
                            type="button"
                            onClick={() => { setShowRegistration(false); setError(''); }}
                            className="text-sm text-muted-foreground hover:text-primary transition-colors underline"
                        >
                            ← Volver al inicio de sesión
                        </button>
                    </div>
                )}

                {!showRegistration && (
                    <div className="mt-8 text-center">
                        <p className="text-xs text-muted-foreground">
                            Sin contraseñas. Te enviaremos un código de un solo uso a tu correo.
                        </p>
                    </div>
                )}
            </div>
        </div>
    );
}
