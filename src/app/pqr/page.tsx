"use client";

import { useState } from "react";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";

export default function PqrPage() {
    const [formData, setFormData] = useState({
        customer_name: "",
        customer_id: "",
        customer_email: "",
        order_number: "",
        type: "Petición",
        description: "",
        acceptedPrivacy: false,
    });
    const [isSubmitting, setIsSubmitting] = useState(false);
    const [successData, setSuccessData] = useState<{ radicado: string } | null>(null);
    const [error, setError] = useState<string | null>(null);

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;
        setFormData(prev => ({
            ...prev,
            [name]: type === "checkbox" ? (e.target as HTMLInputElement).checked : value,
        }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setError(null);

        if (!formData.acceptedPrivacy) {
            setError("Debes aceptar la Política de Privacidad para enviar tu solicitud.");
            return;
        }

        setIsSubmitting(true);
        try {
            const apiUrl = process.env.NEXT_PUBLIC_API_URL || "http://localhost:3050";
            const response = await fetch(`${apiUrl}/api/pqr`, {
                method: "POST",
                headers: { "Content-Type": "application/json" },
                body: JSON.stringify({
                    customer_name: formData.customer_name,
                    customer_id: formData.customer_id,
                    customer_email: formData.customer_email,
                    order_number: formData.order_number,
                    type: formData.type,
                    description: formData.description,
                }),
            });

            if (!response.ok) {
                throw new Error("Ocurrió un error al enviar la solicitud.");
            }

            const data = await response.json();
            setSuccessData({ radicado: data.radicado });
        } catch (err: unknown) {
            if (err instanceof Error) {
                setError(err.message || "Hubo un problema de conexión. Intenta nuevamente.");
            } else {
                setError("Hubo un problema de conexión. Intenta nuevamente.");
            }
        } finally {
            setIsSubmitting(false);
        }
    };

    if (successData) {
        return (
            <div className="min-h-screen bg-secondary/20 pt-32 pb-24 flex items-center justify-center">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border max-w-2xl text-center">
                    <div className="w-16 h-16 bg-green-100 text-green-600 rounded-full flex items-center justify-center mx-auto mb-6">
                        <svg className="w-8 h-8" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path></svg>
                    </div>
                    <h2 className="text-3xl font-serif font-bold text-primary mb-4">Solicitud Recibida</h2>
                    <p className="text-lg text-primary/80 mb-6">
                        Tu radicado de seguimiento es: <strong className="text-accent">{successData.radicado}</strong>
                    </p>
                    <p className="text-muted-foreground mb-8">
                        Hemos enviado una confirmación a tu correo. De acuerdo a la ley colombiana, te daremos respuesta en un plazo máximo de 15 días hábiles.
                    </p>
                    <Link href="/">
                        <Button className="w-full sm:w-auto">Volver al inicio</Button>
                    </Link>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-secondary/20 pt-32 pb-24">
            <div className="container mx-auto px-6 max-w-3xl">
                <div className="bg-white p-8 md:p-12 rounded-3xl shadow-sm border border-border">
                    <div className="text-center mb-10">
                        <h1 className="text-4xl md:text-5xl font-serif font-bold text-primary mb-4 tracking-tight">Radicar PQR</h1>
                        <p className="text-muted-foreground">
                            Peticiones, Quejas y Reclamos.
                        </p>
                    </div>

                    <form onSubmit={handleSubmit} className="space-y-6">
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="customer_name">Nombre Completo *</Label>
                                <Input
                                    id="customer_name"
                                    name="customer_name"
                                    value={formData.customer_name}
                                    onChange={handleChange}
                                    required
                                    placeholder="Ej. Juan Pérez"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="customer_id">Cédula / NIT *</Label>
                                <Input
                                    id="customer_id"
                                    name="customer_id"
                                    value={formData.customer_id}
                                    onChange={handleChange}
                                    required
                                    placeholder="Documento de identidad"
                                />
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                            <div className="space-y-2">
                                <Label htmlFor="customer_email">Correo Electrónico *</Label>
                                <Input
                                    id="customer_email"
                                    name="customer_email"
                                    type="email"
                                    value={formData.customer_email}
                                    onChange={handleChange}
                                    required
                                    placeholder="tu@correo.com"
                                />
                            </div>
                            <div className="space-y-2">
                                <Label htmlFor="order_number">Número de Pedido</Label>
                                <Input
                                    id="order_number"
                                    name="order_number"
                                    value={formData.order_number}
                                    onChange={handleChange}
                                    placeholder="Opcional. Ej. #1024"
                                />
                            </div>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="type">Tipo de Solicitud *</Label>
                            <select
                                id="type"
                                name="type"
                                value={formData.type}
                                onChange={handleChange}
                                required
                                className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                <option value="Petición">Petición</option>
                                <option value="Queja">Queja</option>
                                <option value="Reclamo">Reclamo</option>
                                <option value="Sugerencia">Sugerencia</option>
                                <option value="Cambio / Retracto">Cambio / Derecho de Retracto</option>
                            </select>
                        </div>

                        <div className="space-y-2">
                            <Label htmlFor="description">Descripción Detallada *</Label>
                            <Textarea
                                id="description"
                                name="description"
                                value={formData.description}
                                onChange={handleChange}
                                required
                                rows={5}
                                placeholder="Por favor detalla tu inquietud o el problema presentado..."
                            />
                        </div>

                        <div className="flex items-start space-x-3 pt-2">
                            <div className="flex items-center h-5">
                                <input
                                    id="acceptedPrivacy"
                                    name="acceptedPrivacy"
                                    type="checkbox"
                                    checked={formData.acceptedPrivacy}
                                    onChange={handleChange}
                                    className="h-4 w-4 bg-background border-input text-primary rounded focus:ring-primary"
                                />
                            </div>
                            <div className="text-sm">
                                <label htmlFor="acceptedPrivacy" className="font-medium text-primary">Acepto la Política de Privacidad *</label>
                                <p className="text-muted-foreground">
                                    He leído y autorizo de manera previa, expresa e inequívoca a Two Six el tratamiento de mis datos personales conforme a la {" "}
                                    <Link href="/politicas/privacidad" target="_blank" className="text-accent underline font-semibold">Política de Privacidad (Ley 1581 de 2012)</Link>,
                                    para la gestión de esta solicitud.
                                </p>
                            </div>
                        </div>

                        {error && (
                            <div className="p-4 bg-red-50 text-red-600 rounded-lg text-sm">
                                {error}
                            </div>
                        )}

                        <div className="pt-4">
                            <Button type="submit" className="w-full" disabled={isSubmitting}>
                                {isSubmitting ? "Enviando solicitud..." : "Generar Radicado"}
                            </Button>
                        </div>
                    </form>
                </div>
            </div>
        </div>
    );
}
