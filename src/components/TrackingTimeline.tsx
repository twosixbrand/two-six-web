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
    delivery_method?: string;
    pickup_status?: string;
    shipments?: Shipment[];
    payments?: Payment[];
}

interface TrackingTimelineProps {
    order: Order;
}

const statusMap = {
    'Pendiente': 0,
    'Aprobado PCE': 1,
    'Pagado': 1,
    'Enviado': 2,
    'Entregado': 3,
    'Entregado y Pagado': 3,
};

export const TrackingTimeline: React.FC<TrackingTimelineProps> = ({ order }) => {
    // Determinar si la orden está cancelada o rechazada
    const isErrorState = order.status === 'Cancelado' || order.status === 'Rechazado';

    const isPCE = order.payment_method === 'WOMPI_COD';

    // LOGICA PARA ENVIOS (SHIPPING)
    let shippingCurrentStepIndex = statusMap[order.status as keyof typeof statusMap] ?? 0;
    if (order.status === 'Devuelto y No pagado') {
        shippingCurrentStepIndex = 3;
    } else if (!statusMap.hasOwnProperty(order.status as string) && !isErrorState) {
        if (order.shipments && order.shipments.length > 0) {
            shippingCurrentStepIndex = 2; // Enviado
        } else if (order.payments && order.payments.length > 0) {
            shippingCurrentStepIndex = 1; // Pagado
        }
    }

    const isDevueltoPCE = order.status === 'Devuelto y No pagado';

    const shippingSteps = [
        {
            title: 'Pedido Registrado',
            description: 'Recibimos tu solicitud',
            icon: Clock,
            date: order.order_date,
            isCompleted: shippingCurrentStepIndex >= 0 || isErrorState,
        },
        {
            title: isPCE ? 'Aprobado PCE' : 'Pago Confirmado',
            description: isPCE ? 'Contra Entrega' : 'Transacción exitosa',
            icon: Check,
            date: order.payments?.[0]?.transaction_date || (isPCE ? order.order_date : undefined),
            isCompleted: shippingCurrentStepIndex >= 1,
            isError: isErrorState && shippingCurrentStepIndex < 1,
        },
        {
            title: 'Enviado',
            description: 'Paquete en tránsito',
            icon: Truck,
            date: order.shipments?.[0]?.createdAt,
            isCompleted: shippingCurrentStepIndex >= 2,
        },
        {
            title: isDevueltoPCE ? 'Devuelto y No pagado' : (isPCE && shippingCurrentStepIndex >= 3 ? 'Entregado y Pagado' : 'Entregado'),
            description: isDevueltoPCE ? 'Reembolso / Retorno' : (isPCE ? 'PCE completado' : 'En tus manos'),
            icon: isDevueltoPCE ? XCircle : Check,
            date: order.shipments?.[0]?.delivery_date || order.shipments?.[0]?.trackingHistory?.[0]?.update_date,
            isCompleted: shippingCurrentStepIndex >= 3,
            isError: isDevueltoPCE,
        },
    ];

    // LOGICA PARA RECOGER (PICKUP)
    let pickupCurrentStepIndex = isErrorState ? 0 : 0;
    if (!isErrorState) {
        if (order.pickup_status === 'UNCLAIMED' || order.status === 'No Reclamado') {
            pickupCurrentStepIndex = 4;
        } else if (order.pickup_status === 'COLLECTED' || order.status === 'Entregado') pickupCurrentStepIndex = 4;
        else if (order.pickup_status === 'READY') pickupCurrentStepIndex = 3;
        else if (order.pickup_status === 'PREPARING' || order.status === 'Preparando Pedido') pickupCurrentStepIndex = 2;
        else if (order.payments && order.payments.length > 0) pickupCurrentStepIndex = 1;
        else if (statusMap[order.status as keyof typeof statusMap] >= 1) pickupCurrentStepIndex = 1; 
    }

    const pickupSteps = [
        {
            title: 'Pedido Registrado',
            description: 'Recibimos tu solicitud',
            icon: Clock,
            date: order.order_date,
            isCompleted: pickupCurrentStepIndex >= 0 || isErrorState,
        },
        {
            title: 'Pago Confirmado',
            description: 'Transacción exitosa',
            icon: Check,
            date: order.payments?.[0]?.transaction_date,
            isCompleted: pickupCurrentStepIndex >= 1,
            isError: isErrorState && pickupCurrentStepIndex < 1,
        },
        {
            title: 'Preparando',
            description: 'Alistando tu pedido',
            icon: Package,
            date: undefined,
            isCompleted: pickupCurrentStepIndex >= 2,
        },
        {
            title: 'Listo',
            description: 'Te esperamos en tienda',
            icon: Check,
            date: undefined, 
            isCompleted: pickupCurrentStepIndex >= 3,
        },
        {
            title: order.pickup_status === 'UNCLAIMED' ? 'No Reclamado' : 'Recogido',
            description: order.pickup_status === 'UNCLAIMED' ? 'Tiempo expirado' : 'Entregado en tienda',
            icon: order.pickup_status === 'UNCLAIMED' ? XCircle : Check,
            date: undefined,
            isCompleted: pickupCurrentStepIndex >= 4,
            isError: order.pickup_status === 'UNCLAIMED',
        },
    ];

    const isPickup = order.delivery_method === 'PICKUP';
    const steps = isPickup ? pickupSteps : shippingSteps;
    const currentStepIndex = isPickup ? pickupCurrentStepIndex : shippingCurrentStepIndex;

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
        steps.splice(2, steps.length - 2);
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
                {!isErrorState && currentStepIndex === steps.length - 1 && <span className="text-sm font-normal px-2 py-1 bg-green-100 text-green-700 rounded-full ml-auto">¡Completado!</span>}
            </h3>

            <div className="relative flex flex-col sm:flex-row justify-between w-full">

                {steps.map((step, index) => {
                    const isActive = currentStepIndex === index && !isErrorState;
                    const isPast = step.isCompleted && !isActive;
                    const isErr = step.isError;

                    const Icon = step.icon;

                    // Progreso dinámico: calculamos el porcentaje para la línea activa (Desktop/Mobile se manejan con CSS)
                    const progressWidth = isErrorState ? '0%' : `${(currentStepIndex / (steps.length - 1)) * 100}%`;

                    return (
                        <div key={index} className="relative z-0 flex sm:flex-col items-start sm:items-center gap-4 sm:gap-3 mb-8 sm:mb-0 group flex-1">
                            {/* Líneas conectoras individuales por cada segmento */}
                            {index < steps.length - 1 && (
                                <div className="absolute left-[19px] sm:left-[50%] top-[38px] sm:top-[19px] bottom-[-32px] sm:bottom-auto w-[2px] sm:w-full h-auto sm:h-[2px] bg-gray-200 -z-10">
                                    <div
                                        className="absolute top-0 left-0 w-full h-full bg-accent transition-all duration-700 ease-in-out"
                                        style={{
                                            transformOrigin: 'top left',
                                            transform: currentStepIndex > index
                                                ? 'scale3d(1, 1, 1)'
                                                : 'scale3d(0, 0, 1)' // CSS handle scaleX for desktop, scaleY for mobile (we can do it via CSS classes easily)
                                        }}
                                    >
                                        <style dangerouslySetInnerHTML={{
                                            __html: `
                                            @media (min-width: 640px) {
                                                .progress-segment-${index} { transform: ${currentStepIndex > index ? 'scaleX(1)' : 'scaleX(0)'}; transform-origin: left; }
                                            }
                                            @media (max-width: 639px) {
                                                .progress-segment-${index} { transform: ${currentStepIndex > index ? 'scaleY(1)' : 'scaleY(0)'}; transform-origin: top; }
                                            }
                                        `}} />
                                    </div>
                                    {/* Linea activa simplificada con las clases de arriba */}
                                    <div className={`progress-segment-${index} absolute top-0 left-0 w-full h-full bg-accent transition-transform duration-700 ease-out`} />
                                </div>
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
