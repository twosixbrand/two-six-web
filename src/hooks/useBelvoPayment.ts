import { useState, useCallback } from 'react';
import { useRouter } from 'next/navigation';

const isDev = process.env.NODE_ENV === 'development';
const debugLog = (...args: unknown[]) => { if (isDev) console.log(...args); };

// Extiende Window para que TypeScript reconozca el SDK de Belvo
declare global {
    interface Window {
        belvoSDK?: {
            createWidget: (token: string, options: BelvoWidgetOptions) => { build: () => void };
        };
    }
}

interface BelvoWidgetOptions {
    locale: string;
    country_codes: string[];
    access_mode: string;
    callback: (link: string, institution: string) => void;
    onExit: (data: unknown) => void;
    onError: (data: unknown) => void;
}

interface UseBelvoPaymentProps {
    onSuccess?: (reference: string) => void;
    onError?: (error: string) => void;
}

// Carga dinámica del script del widget de Belvo (se ejecuta solo una vez)
const loadBelvoScript = (): Promise<void> => {
    return new Promise((resolve, reject) => {
        if (typeof window === 'undefined') return reject(new Error('SSR'));

        if (document.getElementById('belvo-widget-script')) {
            // Script ya cargado
            resolve();
            return;
        }

        const script = document.createElement('script');
        script.id = 'belvo-widget-script';
        script.src = 'https://cdn.belvo.io/belvo-widget-1-stable.js';
        script.async = true;
        script.onload = () => {
            debugLog('[Belvo] Script del widget cargado correctamente');
            resolve();
        };
        script.onerror = () => reject(new Error('No se pudo cargar el script del widget de Belvo'));
        document.head.appendChild(script);
    });
};

export const useBelvoPayment = ({ onSuccess, onError }: UseBelvoPaymentProps = {}) => {
    const [isStartingBelvo, setIsStartingBelvo] = useState(false);
    const router = useRouter();

    const startBelvoFlow = useCallback(async (belvoData: { reference: string; amount: number }) => {
        debugLog('[Belvo] 1. Iniciando flujo con datos:', belvoData);
        setIsStartingBelvo(true);

        try {
            if (!belvoData?.reference) {
                throw new Error('Datos de Belvo inválidos: falta la referencia de la orden.');
            }

            // ── Paso 1: Obtener Widget Access Token desde el backend ──
            debugLog('[Belvo] 2. Solicitando Widget Access Token al backend...');
            const tokenResponse = await fetch(
                `${process.env.NEXT_PUBLIC_API_URL}/api/belvo/widget-token`,
                { method: 'GET', headers: { 'Content-Type': 'application/json' } }
            );

            if (!tokenResponse.ok) {
                const errData = await tokenResponse.json().catch(() => ({}));
                throw new Error(errData.message || 'No se pudo obtener el token del widget de Belvo');
            }

            const { token } = await tokenResponse.json();
            debugLog('[Belvo] 3. Token recibido correctamente');

            // ── Paso 2: Cargar el script del widget de Belvo ──
            await loadBelvoScript();
            debugLog('[Belvo] 4. Script del widget cargado');

            // ── Paso 3: Esperar a que belvoSDK esté disponible en window ──
            await new Promise<void>((resolve, reject) => {
                const maxWait = 5000; // 5 segundos
                const interval = 100;
                let elapsed = 0;
                const timer = setInterval(() => {
                    if (window.belvoSDK) {
                        clearInterval(timer);
                        resolve();
                    } else if (elapsed >= maxWait) {
                        clearInterval(timer);
                        reject(new Error('Timeout: belvoSDK no se inicializó'));
                    }
                    elapsed += interval;
                }, interval);
            });

            // ── Paso 4: Inicializar el widget de Belvo ──
            debugLog('[Belvo] 5. Inicializando widget...');
            window.belvoSDK!.createWidget(token, {
                locale: 'es',
                country_codes: ['CO'],
                access_mode: 'single',

                // Éxito: el usuario vinculó su cuenta bancaria
                callback: (link: string, institution: string) => {
                    debugLog('[Belvo] 6. Cuenta vinculada exitosamente:', { link, institution });
                    setIsStartingBelvo(false);

                    if (onSuccess) onSuccess(belvoData.reference);

                    // Redirigir a la página de éxito con estado "pendiente de pago"
                    router.push(
                        `/checkout/success?belvoLink=${link}&reference=${belvoData.reference}&status=pending`
                    );
                },

                // El usuario cerró el widget sin completar
                onExit: (data: unknown) => {
                    debugLog('[Belvo] 7. Usuario salió del widget:', data);
                    setIsStartingBelvo(false);
                },

                // Error en el widget
                onError: (data: unknown) => {
                    console.error('[Belvo] Error en el widget:', data);
                    setIsStartingBelvo(false);
                    const errorMessage = typeof data === 'string'
                        ? data
                        : 'Error al conectar con tu banco. Por favor intenta de nuevo.';
                    if (onError) onError(errorMessage);
                },
            }).build();

        } catch (error: unknown) {
            console.error('[Belvo] ERROR en startBelvoFlow:', error);
            setIsStartingBelvo(false);
            const errorMessage = error instanceof Error
                ? error.message
                : 'Error al iniciar la conexión con Belvo.';
            if (onError) onError(errorMessage);
            throw error;
        }
    }, [onSuccess, onError, router]);

    return {
        startBelvoFlow,
        isStartingBelvo,
    };
};
