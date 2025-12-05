"use client";

import { useSearchParams } from "next/navigation";
import Link from "next/link";
import { useEffect, useState, Suspense } from "react";
import { useCart } from "@/context/CartContext";

function SuccessContent() {
    const searchParams = useSearchParams();
    const { clearCart } = useCart();
    const orderId = searchParams.get("orderId");
    const transactionId = searchParams.get("id") || searchParams.get("transactionId"); // Soporte para redirección Wompi ('id') y manual ('transactionId')

    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [message, setMessage] = useState('Verificando pago...');

    useEffect(() => {
        if (transactionId) {
            // Verificar con el backend
            fetch('http://localhost:3050/api/order/verify-payment', {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ transactionId })
            })
                .then(res => res.json())
                .then(data => {
                    if (data.status === 'APPROVED') {
                        setStatus('success');
                        setMessage('¡Pago aprobado exitosamente!');
                        clearCart(); // Limpiar carrito al confirmar pago
                    } else {
                        setStatus('error');
                        setMessage(`El pago no fue aprobado. Estado: ${data.status}`);
                    }
                })
                .catch(err => {
                    console.error(err);
                    setStatus('error');
                    setMessage('Hubo un error verificando el pago.');
                });
        } else if (orderId) {
            // Flujo antiguo o directo sin pago inmediato (si aplica)
            setStatus('success');
            setMessage('Orden creada exitosamente.');
        } else {
            setStatus('error');
            setMessage('No se encontró información de la orden.');
        }
    }, [orderId, transactionId, clearCart]);

    return (
        <div className="bg-white p-8 rounded-lg shadow-md max-w-md w-full text-center">
            {status === 'loading' && (
                <div className="animate-spin rounded-full h-16 w-16 border-t-4 border-b-4 border-accent mx-auto mb-4"></div>
            )}

            {status === 'success' && (
                <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg
                        className="w-8 h-8 text-green-500"
                        fill="none"
                        stroke="currentColor"
                        viewBox="0 0 24 24"
                        xmlns="http://www.w3.org/2000/svg"
                    >
                        <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M5 13l4 4L19 7"
                        ></path>
                    </svg>
                </div>
            )}

            {status === 'error' && (
                <div className="w-16 h-16 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-4">
                    <svg className="w-8 h-8 text-red-500" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M6 18L18 6M6 6l12 12" />
                    </svg>
                </div>
            )}

            <h1 className="text-2xl font-bold text-gray-800 mb-2">
                {status === 'success' ? '¡Gracias por tu compra!' : (status === 'error' ? 'Algo salió mal' : 'Procesando...')}
            </h1>

            <p className="text-gray-600 mb-6">
                {message}
            </p>

            {(orderId || transactionId) && (
                <p className="text-sm text-gray-500 mb-6">Referencia: {orderId || transactionId}</p>
            )}

            <Link
                href="/"
                className="inline-block bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-300"
            >
                Volver a la tienda
            </Link>
        </div>
    );
}

export default function SuccessPage() {
    return (
        <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50 px-4">
            <Suspense fallback={<div>Cargando...</div>}>
                <SuccessContent />
            </Suspense>
        </div>
    );
}
