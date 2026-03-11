"use client";

import { useCart } from "@/context/CartContext";
import CheckoutForm from "@/components/CheckoutForm";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { useSearchParams, useRouter } from "next/navigation";
import { useEffect, useState, useCallback } from "react";

import { Suspense } from "react";

function CheckoutContent() {
    const { cartItems, itemCount, cartTotal, clearCart } = useCart();
    const searchParams = useSearchParams();
    const router = useRouter();
    const transactionId = searchParams?.get("id");

    const [verifying, setVerifying] = useState(false);
    const [verificationResult, setVerificationResult] = useState<{ status: string; message: string } | null>(null);

    const verifyTransaction = useCallback(async (id: string) => {
        setVerifying(true);
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/verify-payment`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify({ transactionId: id }),
            });

            const data = await response.json();

            if (data.status === "APPROVED") {
                setVerificationResult({ status: "APPROVED", message: "¡Pago aprobado! Redirigiendo..." });
                clearCart();
                setTimeout(() => {
                    router.push(`/checkout/success?orderId=${data.orderId}`);
                }, 2000);
            } else if (data.status === "DECLINED") {
                setVerificationResult({ status: "DECLINED", message: "El pago fue rechazado por el banco." });
            } else {
                setVerificationResult({ status: "PENDING", message: "El pago está en proceso de validación." });
            }
        } catch (error) {
            console.error("Error verifying payment:", error);
            setVerificationResult({ status: "ERROR", message: "Error al verificar el pago." });
        } finally {
            setVerifying(false);
        }
    }, [clearCart, router]);

    const [verifiedId, setVerifiedId] = useState<string | null>(null);

    useEffect(() => {
        if (transactionId && transactionId !== verifiedId) {
            setVerifiedId(transactionId);
            verifyTransaction(transactionId);
        }
    }, [transactionId, verifiedId, verifyTransaction]);

    if (verifying) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-primary mb-4">Verificando pago...</h1>
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
            </div>
        );
    }

    if (verificationResult) {
        return (
            <div className="container mx-auto px-4 py-20 text-center">
                <h1 className="text-3xl font-bold text-primary mb-4">
                    {verificationResult.status === "APPROVED" ? "¡Gracias por tu compra!" : "Estado del Pago"}
                </h1>
                <p className={`text-xl mb-8 ${verificationResult.status === "APPROVED" ? "text-green-600" : "text-red-600"}`}>
                    {verificationResult.message}
                </p>

                {verificationResult.status === "APPROVED" ? (
                    <Link href="/" className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-hover transition-colors">
                        Volver a la Tienda
                    </Link>
                ) : (
                    <button
                        onClick={() => {
                            setVerificationResult(null);
                            router.push("/checkout");
                        }}
                        className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-hover transition-colors"
                    >
                        Intentar Nuevamente
                    </button>
                )}
            </div>
        );
    }

    if (itemCount === 0) {
        return (
            <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
                <h1 className="text-4xl font-serif text-primary mb-6">Tu Bolsa está Vacía</h1>
                <p className="text-muted-foreground text-lg mb-10 max-w-md">No puedes finalizar la compra sin artículos.</p>
                <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent/90 px-10 py-6 text-lg tracking-wider uppercase">
                    <Link href="/">Volver a la Tienda</Link>
                </Button>
            </div>
        );
    }

    return (
        <div className="bg-secondary/20 min-h-screen py-16">
            <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
                <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-10 tracking-tight">Finalizar Compra</h1>

                <CheckoutForm />
            </div>
        </div>
    );
}

export default function CheckoutPage() {
    return (
        <Suspense fallback={
            <div className="container mx-auto px-4 py-20 text-center">
                <div className="animate-spin rounded-full h-12 w-12 border-t-2 border-b-2 border-accent mx-auto"></div>
            </div>
        }>
            <CheckoutContent />
        </Suspense>
    );
}
