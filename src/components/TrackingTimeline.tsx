// src/components/TrackingTimeline.tsx
import React from 'react';
import { Check, Clock, Package, Truck, XCircle } from 'lucide-react';

interface TrackingHistory {
    status: string;
    location: string;
    update_date: string;
}

interface Shipment {
    id: number;
    guide_number: string;
    status: string;
    shippingProvider?: {
        name: string;
    };
    trackingHistory?: TrackingHistory[];
    createdAt: string;
    delivery_date?: string;
}

interface Payment {
    transaction_date: string;
    status: string;
}

interface Order {
    id: number;
    order_date: string;
    status: string;
    shipments?: Shipment[];
    payments?: Payment[];
}

interface TrackingTimelineProps {
    order: Order;
}

const statusMap = {
    'Pendiente': 0,
    'Pagado': 1,
    'Enviado': 2,
    'Entregado': 3,
};

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ order }) => {
    // Determinar si la orden está cancelada o rechazada
    const isErrorState = order.status === 'Cancelado' || order.status === 'Rechazado';

    // Determinar el paso actual basado en el estado
    let currentStepIndex = statusMap[order.status as keyof typeof statusMap] ?? 0;

    // Fallback: si el estado no está en el mapa pero hay envíos
    if (!statusMap.hasOwnProperty(order.status) && !isErrorState) {
        if (order.shipments && order.shipments.length > 0) {
            currentStepIndex = 2; // Enviado
        } else if (order.payments && order.payments.length > 0) {
            currentStepIndex = 1; // Pagado
        }
    }

    const steps = [
        {
            title: 'Pedido Registrado',
            description: 'Recibimos tu solicitud',
            icon: Clock,
            date: order.order_date,
            isCompleted: currentStepIndex >= 0 || isErrorState,
        },
        {
            title: 'Pago Confirmado',
            description: 'Transacción exitosa',
            icon: Check,
            date: order.payments?.[0]?.transaction_date,
            isCompleted: currentStepIndex >= 1,
            isError: isErrorState && currentStepIndex < 1,
        },
        {
            title: 'Enviado',
            description: 'Paquete en tránsito',
            icon: Truck,
            date: order.shipments?.[0]?.createdAt,
            isCompleted: currentStepIndex >= 2,
        },
        {
            title: 'Entregado',
            description: 'En tus manos',
            icon: Package,
            // Priorizamos la fecha de entrega real, si no, la última actualización de tracking
            date: order.shipments?.[0]?.delivery_date || order.shipments?.[0]?.trackingHistory?.[0]?.update_date,
            isCompleted: currentStepIndex >= 3,
        },
    ];

    if (isErrorState) {
        steps[1] = {
            title: 'Pago Fallido / Anulado',
            description: `Estado: ${order.status}`,
            icon: XCircle,
            date: order.payments?.[0]?.transaction_date || new Date().toISOString(),
            isCompleted: true,
            isError: true,
        };
        // Ocultar pasos posteriores si hay error en el pago
        steps.splice(2, 2);
    }

    const formatDate = (dateString?: string) => {
        if (!dateString) return null;
        const date = new Date(dateString);
        return new Intl.DateTimeFormat('es-CO', {
            day: '2-digit',
            month: 'short',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        }).format(date);
    };

    return (
        <div className="w-full py-8 px-4 sm:px-8 bg-white/50 backdrop-blur-xl border border-white/20 rounded-2xl shadow-xl overflow-hidden mb-8 relative">
            {/* Decoración Premium de Fondo */}
            <div className="absolute top-0 right-0 w-64 h-64 bg-accent/5 rounded-full blur-[80px] -z-10 pointer-events-none" />
            <div className="absolute bottom-0 left-0 w-48 h-48 bg-gray-500/5 rounded-full blur-[60px] -z-10 pointer-events-none" />

            <h3 className="text-xl font-bold mb-8 text-gray-900 tracking-tight flex items-center gap-2">
                Estado de tu Pedido
                {isErrorState && <span className="text-sm font-normal px-2 py-1 bg-red-100 text-red-700 rounded-full ml-auto">{order.status}</span>}
                {!isErrorState && currentStepIndex === 3 && <span className="text-sm font-normal px-2 py-1 bg-green-100 text-green-700 rounded-full ml-auto">¡Completado!</span>}
            </h3>

            <div className="relative flex flex-col sm:flex-row justify-between w-full">
                {/* Línea conectora de fondo (mobile: vertical, desktop: horizontal) */}
                <div className="absolute left-[19px] sm:left-0 top-[24px] sm:top-[20px] bottom-0 sm:bottom-auto sm:right-0 w-[2px] sm:w-full sm:h-[2px] bg-gray-200 z-0" />

                {/* Línea conectora activa */}
                {!isErrorState && (
                    <div
                        className="absolute left-[19px] sm:left-0 top-[24px] sm:top-[20px] w-[2px] sm:h-[2px] bg-accent z-0 transition-all duration-1000 ease-in-out"
                        style={{
                            height: 'auto', // CSS lo manejará dependiendo de media queries o se deja por defecto para desktop
                            bottom: 'auto',
                            // En Desktop el width depende del step. En móvil el height. Usamos utilidades de Tailwind para esto
                        }}
                    >
                        {/* Truco: Aplicamos el progreso con width en desktop y height en mobile vía inline-style o clases calculadas en el JSX inferior */}
                    </div>
                )}

                {steps.map((step, index) => {
                    const isActive = currentStepIndex === index && !isErrorState;
                    const isPast = step.isCompleted && !isActive;
                    const isErr = step.isError;

                    const Icon = step.icon;

                    // Progreso dinámico: calculamos el porcentaje para la línea activa (Desktop/Mobile se manejan con CSS)
                    const progressWidth = isErrorState ? '0%' : `${(currentStepIndex / (steps.length - 1)) * 100}%`;

                    return (
                        <div key={index} className="relative z-10 flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3 mb-8 sm:mb-0 group flex-1">
                            {/* Primer paso fija el inicio de la línea de progreso horizontal global */}
                            {index === 0 && !isErrorState && (
                                <style dangerouslySetInnerHTML={{
                                    __html: `
                                    @media (min-width: 640px) {
                                        .progress-line-active { width: ${progressWidth}; height: 2px; }
                                    }
                                    @media (max-width: 639px) {
                                        .progress-line-active { height: ${progressWidth}; width: 2px; }
                                    }
                                `}} />
                            )}
                            {/* Usamos un div fantasma renderizado solo 1 vez para la barra real de progreso combinada */}
                            {index === 0 && !isErrorState && (
                                <div className="progress-line-active absolute left-[19px] sm:left-0 top-[24px] sm:top-[20px] bg-accent z-0 transition-all duration-1000 ease-in-out" />
                            )}


                            {/* Círculo Icono */}
                            <div
                                className={`
                                    w-10 h-10 rounded-full flex items-center justify-center shrink-0 border-2 transition-all duration-500
                                    ${isErr
                                        ? 'bg-white border-red-500 text-red-500'
                                        : isPast
                                            ? 'bg-accent border-accent text-white shadow-[0_0_15px_rgba(234,179,8,0.4)]'
                                            : isActive
                                                ? 'bg-white border-accent text-accent shadow-[0_0_20px_rgba(234,179,8,0.6)] animate-pulse-soft'
                                                : 'bg-white border-gray-200 text-gray-300'
                                    }
                                `}
                            >
                                <Icon size={isActive || isPast ? 20 : 18} strokeWidth={isPast ? 2.5 : 2} />
                            </div>

                            {/* Contenido Texto */}
                            <div className="flex flex-col sm:items-center sm:text-center mt-1 sm:mt-0 pb-6 sm:pb-0">
                                <h4 className={`text-sm font-bold tracking-wide uppercase transition-colors duration-300 
                                    ${isErr ? 'text-red-600' : (isPast || isActive) ? 'text-gray-900' : 'text-gray-400'}
                                `}>
                                    {step.title}
                                </h4>
                                <p className={`text-xs mt-1 transition-colors duration-300
                                    ${isErr ? 'text-red-500/80' : isActive ? 'text-gray-600 font-medium' : 'text-gray-500'}
                                `}>
                                    {step.description}
                                </p>

                                <div className={`text-[11px] mt-2 font-mono tracking-tight transition-all duration-500
                                    ${step.date ? 'opacity-100 translate-y-0' : 'opacity-0 translate-y-2'}
                                    ${isErr ? 'text-red-400' : 'text-gray-400'}
                                `}>
                                    {formatDate(step.date)}
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
};
