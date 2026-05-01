import { useState } from 'react';

const isDev = process.env.NODE_ENV === 'development';
const debugLog = (...args: unknown[]) => { if (isDev) console.log(...args); };

interface UseBelvoPaymentProps {
    onSuccess?: (reference: string) => void;
    onError?: (error: string) => void;
}

export const useBelvoPayment = ({ onSuccess, onError }: UseBelvoPaymentProps = {}) => {
    const [isStartingBelvo, setIsStartingBelvo] = useState(false);

    const startBelvoFlow = async (belvoData: any) => {
        debugLog('[Belvo] 1. Iniciando flujo de Belvo con datos:', belvoData);
        setIsStartingBelvo(true);

        try {
            if (!belvoData || !belvoData.reference) {
                throw new Error("Datos de Belvo inválidos recibidos desde el servidor.");
            }

            // TODO: Inicializar el widget de Belvo aquí con `belvoData` o redirigir a un Link
            
            // Simulación genérica temporal
            alert('La integración interactiva con el widget de Belvo (Open Banking) se está construyendo. Tu orden fue creada exitosamente con referencia: ' + belvoData.reference);
            
            // Si estuviéramos recibiendo callbacks del widget:
            // onSuccess(belvoData.reference);
            
            return true;
        } catch (error: unknown) {
            console.error("[Belvo] ERROR en startBelvoFlow:", error);
            const errorMessage = error instanceof Error ? error.message : "Error al iniciar el pago con Belvo.";
            if (onError) onError(errorMessage);
            throw error;
        } finally {
            setIsStartingBelvo(false);
        }
    };

    return {
        startBelvoFlow,
        isStartingBelvo
    };
};
