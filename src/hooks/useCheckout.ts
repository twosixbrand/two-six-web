import { useState } from 'react';

const isDev = process.env.NODE_ENV === 'development';
const debugLog = (...args: unknown[]) => { if (isDev) console.log(...args); };

export const useCheckout = () => {
    const [isProcessingCheckout, setIsProcessingCheckout] = useState(false);

    const createOrder = async (checkoutData: unknown) => {
        debugLog('[Checkout] 1. Enviando datos al backend para crear orden...', checkoutData);
        setIsProcessingCheckout(true);

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_URL}/api/order/checkout`, {
                method: "POST",
                headers: {
                    "Content-Type": "application/json",
                },
                body: JSON.stringify(checkoutData),
            });

            debugLog('[Checkout] 2. Respuesta del backend:', response.status);

            if (!response.ok) {
                const errorData = await response.json();
                console.error('[Checkout] 2b. Error del backend:', errorData);
                throw new Error(errorData.message || "Error al iniciar el pago");
            }

            const data = await response.json();
            debugLog('[Checkout] 3. Orden creada exitosamente:', data);
            
            return data;
        } catch (error: unknown) {
            console.error("[Checkout] ERROR en createOrder:", error);
            throw error;
        } finally {
            setIsProcessingCheckout(false);
        }
    };

    return {
        createOrder,
        isProcessingCheckout
    };
};
