import { useState, useEffect, useRef } from 'react';

export interface WompiTransaction {
    id: string;
    reference: string;
    status: string;
    [key: string]: unknown;
}

declare global {
    interface Window {
        __startWompiPolling?: (reference: string) => void;
        WidgetCheckout?: new (config: unknown) => { open: (callback: (result: { transaction: WompiTransaction }) => void) => void };
    }
}

interface UseWompiPaymentProps {
    onSuccess: (transaction: WompiTransaction) => void;
    onError: (error: string) => void;
    onCancel: () => void;
}

export const useWompiPayment = ({ onSuccess, onError, onCancel }: UseWompiPaymentProps) => {
    const [loadingPayment, setLoadingPayment] = useState(false);

    // 1. Cargar el script de Wompi
    useEffect(() => {
        if (document.getElementById("wompi-script")) return;

        const script = document.createElement("script");
        script.id = "wompi-script";
        script.src = "https://checkout.wompi.co/widget.js";
        script.async = true;
        document.body.appendChild(script);
    }, []);

    const transactionReference = useRef<string | null>(null);

    // 2. Detectar cuando el usuario cierra el modal con la X o presiona ESC
    useEffect(() => {
        const handleMessage = async (event: MessageEvent) => {
            if (event.data?.event === "escpressed" || (event.data?.from === 'widget-checkout' && event.data?.type === 'widget-closed')) {

                if (transactionReference.current) {
                    try {
                        const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/check-status`, {
                            method: "POST",
                            headers: { "Content-Type": "application/json" },
                            body: JSON.stringify({ reference: transactionReference.current }),
                        });
                        const data = await response.json();

                        if (data.status === 'APPROVED') {
                            onSuccess({
                                id: data.transactionId || 'unknown',
                                status: 'APPROVED',
                                reference: transactionReference.current
                            });
                            // No llamamos a onCancel ni setLoadingPayment(false) aquí para permitir que onSuccess maneje la redirección
                            return;
                        } else if (data.status === 'DECLINED') {
                            onError?.("La transacción fue rechazada por el banco.");
                            setLoadingPayment(false);
                            return;
                        } else if (data.status === 'ERROR') {
                            onError?.("Ocurrió un error en la transacción.");
                            setLoadingPayment(false);
                            return;
                        }
                    } catch (error) {
                        console.error("Error verificando estado al cerrar modal:", error);
                    }
                }

                onCancel?.();
                setLoadingPayment(false);
            }
        };

        window.addEventListener("message", handleMessage);
        return () => window.removeEventListener("message", handleMessage);
    }, [onCancel, onSuccess, onError]);

    // 4. Polling para verificar estado (Fallback para PSE)
    useEffect(() => {
        let intervalId: NodeJS.Timeout;
        let referenceToCheck: string | null = null;

        // Función auxiliar para iniciar el polling
        const startPolling = (reference: string) => {
            referenceToCheck = reference;
            intervalId = setInterval(async () => {
                if (!loadingPayment || !referenceToCheck) return;

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/check-status`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ reference: referenceToCheck }),
                    });

                    const data = await response.json();

                    if (data.status === 'APPROVED') {
                        clearInterval(intervalId);
                        // No llamamos a onSuccess aquí para no cerrar el modal automáticamente.
                        // El evento 'widget-closed' manejará la transición.
                    } else if (data.status === 'DECLINED' || data.status === 'ERROR') {
                        clearInterval(intervalId);
                        onError?.(`El pago finalizó con estado: ${data.status}`);
                        setLoadingPayment(false);
                    }
                } catch (error) {
                    console.error("Error polling status:", error);
                }
            }, 5000); // Consultar cada 5 segundos
        };

        // Exponer la función de inicio de polling en el objeto window para llamarla desde startPaymentFlow
        window.__startWompiPolling = startPolling;

        return () => {
            if (intervalId) clearInterval(intervalId);
            delete window.__startWompiPolling;
        };
    }, [loadingPayment, onError]);

    // 3. Iniciar flujo de pago
    const startPaymentFlow = async (checkoutData: unknown) => {
        setLoadingPayment(true);

        try {
            // A. Iniciar en backend (Checkout)
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(checkoutData),
            });

            if (!response.ok) {
                const errorData = await response.json();
                throw new Error(errorData.message || "Error al iniciar el pago");
            }

            const { wompi } = await response.json();

            // Iniciar polling con la referencia generada
            transactionReference.current = wompi.reference;
            if (window.__startWompiPolling) {
                window.__startWompiPolling(wompi.reference);
            }

            if (!wompi.publicKey || typeof window.WidgetCheckout === 'undefined') {
                throw new Error("La pasarela de pagos no está lista. Por favor recarga la página.");
            }

            // B. Configurar el widget
            const checkoutConfig = {
                currency: wompi.currency,
                amountInCents: wompi.amountInCents,
                reference: wompi.reference,
                publicKey: wompi.publicKey,
                signature: { integrity: wompi.integritySignature },
                ...(window.location.hostname !== 'localhost'
                    ? { redirectUrl: `${window.location.origin}/checkout` }
                    : {}), // Redirección solo en producción para evitar errores en local
                // customerData se omite para permitir que el usuario ingrese sus datos en la pasarela si es necesario
            };

            // C. Abrir widget

            const checkout = new window.WidgetCheckout!(checkoutConfig);

            checkout.open((result: { transaction: WompiTransaction }) => {
                const transaction = result.transaction;

                if (!transaction || !transaction.id || !transaction.status) {
                    return;
                }

                if (transaction.status === 'APPROVED') {
                    onSuccess(transaction);

                } else if (transaction.status === 'DECLINED') {
                    onError?.("La transacción fue rechazada por el banco.");
                    setLoadingPayment(false);
                } else if (transaction.status === 'ERROR') {
                    onError?.("Ocurrió un error en la transacción.");
                    setLoadingPayment(false);
                }
            });

        } catch (error: unknown) {
            console.error("Error en startPaymentFlow:", error);
            const errorMessage = error instanceof Error ? error.message : "Error al iniciar el pago.";
            onError?.(errorMessage);
            setLoadingPayment(false);
        }
    };

    return {
        startPaymentFlow,
        loadingPayment
    };
};
