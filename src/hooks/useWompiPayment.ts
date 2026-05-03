import { useState, useEffect, useRef } from 'react';

const isDev = process.env.NODE_ENV === 'development';
const isTest = process.env.NODE_ENV === 'test';
const debugLog = (...args: unknown[]) => { if (isDev) console.log(...args); };
const debugError = (...args: unknown[]) => { if (isDev || (isTest && process.env.VERBOSE_TEST_LOGS)) console.error(...args); };
const debugWarn = (...args: unknown[]) => { if (isDev || (isTest && process.env.VERBOSE_TEST_LOGS)) console.warn(...args); };

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
    const scriptReady = useRef(false);

    // 1. Cargar el script de Wompi
    useEffect(() => {
        if (typeof window.WidgetCheckout !== 'undefined') {
            scriptReady.current = true;
            debugLog('[Wompi] Script ya estaba cargado.');
            return;
        }

        if (document.getElementById("wompi-script")) {
            // Script tag exists but might still be loading
            const existingScript = document.getElementById("wompi-script") as HTMLScriptElement;
            existingScript.addEventListener('load', () => {
                scriptReady.current = true;
                debugLog('[Wompi] Script cargado (existente).');
            });
            return;
        }

        const script = document.createElement("script");
        script.id = "wompi-script";
        script.src = "https://checkout.wompi.co/widget.js";
        script.async = true;
        script.onload = () => {
            scriptReady.current = true;
            debugLog('[Wompi] Script cargado exitosamente.');
        };
        script.onerror = (err) => {
            debugError('[Wompi] Error cargando script:', err);
        };
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
    const intervalRef = useRef<NodeJS.Timeout | null>(null);
    const pollingReferenceRef = useRef<string | null>(null);
    const loadingPaymentRef = useRef(loadingPayment);

    // Sincronizar el Ref con el estado
    useEffect(() => {
        loadingPaymentRef.current = loadingPayment;
    }, [loadingPayment]);

    useEffect(() => {
        // Función auxiliar para iniciar el polling
        const startPolling = (reference: string) => {
            pollingReferenceRef.current = reference;
            
            if (intervalRef.current) clearInterval(intervalRef.current);
            
            intervalRef.current = setInterval(async () => {
                if (!loadingPaymentRef.current || !pollingReferenceRef.current) return;

                try {
                    const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/check-status`, {
                        method: "POST",
                        headers: { "Content-Type": "application/json" },
                        body: JSON.stringify({ reference: pollingReferenceRef.current }),
                    });

                    const data = await response.json();

                    if (data.status === 'APPROVED') {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                    } else if (data.status === 'DECLINED' || data.status === 'ERROR') {
                        if (intervalRef.current) {
                            clearInterval(intervalRef.current);
                            intervalRef.current = null;
                        }
                        onError?.(`El pago finalizó con estado: ${data.status}`);
                        setLoadingPayment(false);
                    }
                } catch (error) {
                    debugError("Error polling status:", error);
                }
            }, 5000);
        };

        window.__startWompiPolling = startPolling;

        return () => {
            if (intervalRef.current) {
                clearInterval(intervalRef.current);
                intervalRef.current = null;
            }
            delete window.__startWompiPolling;
        };
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [onError]); // Solo depende de onError para evitar reinicios innecesarios

    // 3. Iniciar flujo de pago
    const startPaymentFlow = async (checkoutData: unknown) => {
        debugLog('[Wompi] 1. Iniciando flujo de pago...');
        setLoadingPayment(true);

        try {
            // A. Iniciar en backend (Checkout)
            debugLog('[Wompi] 2. Enviando datos al backend...');
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(checkoutData),
            });

            debugLog('[Wompi] 3. Respuesta del backend:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                debugError('[Wompi] 3b. Error del backend:', errorData);
                throw new Error(errorData.message || "Error al iniciar el pago");
            }

            const data = await response.json();
            debugLog('[Wompi] 4. Datos recibidos del backend.');

            const { wompi } = data;

            if (!wompi) {
                debugError('[Wompi] 4b. No se recibió objeto wompi en la respuesta:', data);
                throw new Error("No se recibieron datos de Wompi del servidor.");
            }

            // Iniciar polling con la referencia generada
            transactionReference.current = wompi.reference;
            if (window.__startWompiPolling) {
                window.__startWompiPolling(wompi.reference);
            }

            debugLog('[Wompi] 5. Esperando a que el script de Wompi esté disponible...');

            // Wait up to 5 seconds for script to load
            const waitForScript = async (maxWaitMs = 5000): Promise<boolean> => {
                const start = Date.now();
                while (Date.now() - start < maxWaitMs) {
                    if (typeof window.WidgetCheckout !== 'undefined') return true;
                    await new Promise(r => setTimeout(r, 200));
                }
                return typeof window.WidgetCheckout !== 'undefined';
            };

            const isReady = await waitForScript();
            debugLog('[Wompi] 5b. WidgetCheckout disponible:', isReady);

            const resolvedPublicKey = wompi.publicKey || wompi.public_key;
            
            if (!resolvedPublicKey || !isReady) {
                throw new Error("La pasarela de pagos no está lista. Por favor recarga la página e intenta nuevamente.");
            }

            // B. Configurar el widget
            const checkoutConfig: any = {
                currency: wompi.currency || 'COP',
                amountInCents: wompi.amountInCents || wompi.amount_in_cents,
                reference: wompi.reference,
                publicKey: resolvedPublicKey,
                // Wompi rechaza redirectUrl con localhost (403).
                ...(process.env.NEXT_PUBLIC_SITE_URL
                    ? { redirectUrl: `${process.env.NEXT_PUBLIC_SITE_URL}/checkout` }
                    : {}),
            };

            const integritySignature = wompi.integritySignature || wompi.integrity_signature;
            if (integritySignature) {
                checkoutConfig.signature = { integrity: integritySignature };
            }

            debugLog('[Wompi] 6. Widget configurado:', checkoutConfig);

            // C. Abrir widget
            debugLog('[Wompi] 7. Creando instancia WidgetCheckout...');
            const checkout = new window.WidgetCheckout!(checkoutConfig);

            debugLog('[Wompi] 8. Abriendo widget...');
            checkout.open((result: { transaction: WompiTransaction }) => {
                debugLog('[Wompi] 9. Callback del widget recibido.');
                const transaction = result.transaction;

                if (!transaction || !transaction.id || !transaction.status) {
                    debugWarn('[Wompi] 9b. Transacción inválida o incompleta.');
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
            debugError("[Wompi] ERROR en startPaymentFlow:", error);
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
