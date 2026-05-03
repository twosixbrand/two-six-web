import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
}));

// Mock CartContext
const mockClearCart = jest.fn();
jest.mock('@/context/CartContext', () => ({
    useCart: () => ({
        clearCart: mockClearCart,
    }),
}));

import SuccessPage from '../../src/app/checkout/success/page';

describe('SuccessPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams.delete('orderId');
        mockSearchParams.delete('id');
        mockSearchParams.delete('transactionId');
    });

    it('shows loading state initially', () => {
        mockSearchParams.set('orderId', '1');
        global.fetch = jest.fn().mockImplementation(() => new Promise(() => { })); // Never resolves
        render(<SuccessPage />);
        expect(screen.getByText('Cargando detalles del pedido...')).toBeInTheDocument();
    });

    it('shows error when no IDs are provided', async () => {
        render(<SuccessPage />);
        await waitFor(() => {
            expect(screen.getByText('No se encontró información de la orden.')).toBeInTheDocument();
        });
    });

    it('shows order details on successful fetch', async () => {
        mockSearchParams.set('orderId', '42');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 42,
                total_payment: 150000,
                shipping_address: 'Calle 123',
                customer: {
                    name: 'Juan Perez',
                    email: 'juan@test.com',
                    current_phone_number: '3001234567',
                },
                orderItems: [
                    {
                        id: 1,
                        product_name: 'Camiseta Test',
                        quantity: 2,
                        unit_price: 75000,
                        size: 'M',
                        color: 'Negro',
                        product: { clothingSize: { clothingColor: { image_url: '/img.jpg' } } },
                    },
                ],
            }),
        });

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText('¡Gracias por tu compra!')).toBeInTheDocument();
        });

        expect(screen.getByText('Camiseta Test')).toBeInTheDocument();
        expect(screen.getByText('Juan Perez')).toBeInTheDocument();
        expect(screen.getByText('Calle 123')).toBeInTheDocument();
        expect(screen.getByText('Volver a la Tienda')).toBeInTheDocument();
    });

    it('shows error on fetch failure', async () => {
        mockSearchParams.set('orderId', '99');
        global.fetch = jest.fn().mockRejectedValue(new Error('Server Error'));

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
        });
    });

    it('verifies payment when only transactionId is present', async () => {
        mockSearchParams.set('id', 'txn_100');
        global.fetch = jest.fn()
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'APPROVED', orderId: 50 }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({
                    id: 50,
                    total_payment: 200000,
                    shipping_address: 'Avenida 456',
                    customer: { name: 'Maria', email: 'maria@test.com', current_phone_number: '3009876543' },
                    orderItems: [],
                }),
            });

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText('¡Gracias por tu compra!')).toBeInTheDocument();
        });
    });

    it('shows error when payment not approved via transactionId', async () => {
        mockSearchParams.set('id', 'txn_fail');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'DECLINED' }),
        });

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText(/no fue aprobado/)).toBeInTheDocument();
        });
    });

    it('shows COD and PICKUP details correctly', async () => {
        mockSearchParams.set('orderId', 'COD-1');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({
                id: 100,
                order_reference: 'TS-COD-1',
                total_payment: 15000, // only shipping paid
                shipping_cost: 15000,
                payment_method: 'WOMPI_COD',
                cod_amount: 85000,
                delivery_method: 'PICKUP',
                pickup_pin: '1234',
                customer: { name: 'Juan', email: 'j@t.com', current_phone_number: '123' },
                orderItems: [],
            }),
        });

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText('A Pagar Contra Entrega (PCE):')).toBeInTheDocument();
            expect(screen.getByText('$85,000')).toBeInTheDocument();
            expect(screen.getByText('Punto de Retiro Seleccionado')).toBeInTheDocument();
            expect(screen.getByText('1234')).toBeInTheDocument();
        });
    });
});
