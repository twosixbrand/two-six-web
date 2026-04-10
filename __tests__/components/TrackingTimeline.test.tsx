import React from 'react';
import { render, screen } from '@testing-library/react';
import { TrackingTimeline } from '../../src/components/TrackingTimeline';

describe('TrackingTimeline', () => {
    const mockOrder: any = {
        id: 1,
        order_date: '2026-04-01T10:00:00Z',
        status: 'Pendiente',
        delivery_method: 'SHIPPING',
        payments: [],
        shipments: []
    };

    it('renders shipping steps for initial state', () => {
        render(<TrackingTimeline order={mockOrder} />);
        expect(screen.getByText('Pedido Registrado')).toBeInTheDocument();
        expect(screen.getByText('Pago Confirmado')).toBeInTheDocument();
        expect(screen.getByText('Enviado')).toBeInTheDocument();
        expect(screen.getByText('Entregado')).toBeInTheDocument();
    });

    it('shows completed state for delivered order', () => {
        const deliveredOrder = { ...mockOrder, status: 'Entregado' };
        render(<TrackingTimeline order={deliveredOrder} />);
        expect(screen.getByText('¡Completado!')).toBeInTheDocument();
    });

    it('shows error state for cancelled order', () => {
        const cancelledOrder = { ...mockOrder, status: 'Cancelado' };
        render(<TrackingTimeline order={cancelledOrder} />);
        expect(screen.getByText('Pago Fallido / Anulado')).toBeInTheDocument();
    });

    it('renders pickup steps for PICKUP delivery method', () => {
        const pickupOrder = { 
            ...mockOrder, 
            delivery_method: 'PICKUP',
            pickup_status: 'READY'
        };
        render(<TrackingTimeline order={pickupOrder} />);
        expect(screen.getByText('Preparando')).toBeInTheDocument();
        expect(screen.getByText('Listo')).toBeInTheDocument();
        expect(screen.getByText('Recogido')).toBeInTheDocument();
    });

    it('handles UNCLAIMED pickup status', () => {
        const unclaimedOrder = { 
            ...mockOrder, 
            delivery_method: 'PICKUP',
            pickup_status: 'UNCLAIMED'
        };
        render(<TrackingTimeline order={unclaimedOrder} />);
        expect(screen.getByText('No Reclamado')).toBeInTheDocument();
        expect(screen.getByText('Tiempo expirado')).toBeInTheDocument();
    });
});
