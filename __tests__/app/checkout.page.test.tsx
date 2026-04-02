import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';

// Mock next/navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => mockSearchParams,
}));

// Mock CartContext
const mockClearCart = jest.fn();
jest.mock('@/context/CartContext', () => ({
    useCart: () => ({
        cartItems: [{ id: 1, name: 'Test Product', price: 50000, quantity: 2, image: '/img.jpg' }],
        itemCount: 2,
        cartTotal: 100000,
        clearCart: mockClearCart,
    }),
}));

// Mock child components
jest.mock('@/components/CheckoutForm', () => ({
    __esModule: true,
    default: () => <div data-testid="checkout-form">CheckoutForm Mock</div>,
}));

jest.mock('@/components/CheckoutSummaryItem', () => ({
    __esModule: true,
    default: ({ item, formatPrice }: any) => (
        <div data-testid="summary-item">{item.name} - {formatPrice(item.price)}</div>
    ),
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

import CheckoutPage from '../../src/app/checkout/page';

describe('CheckoutPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams.delete('id');
    });

    it('renders the checkout form and heading when cart has items', () => {
        render(<CheckoutPage />);
        expect(screen.getByText('Finalizar Compra')).toBeInTheDocument();
        expect(screen.getByTestId('checkout-form')).toBeInTheDocument();
    });

    it('renders verifying state when transaction ID is present', async () => {
        mockSearchParams.set('id', 'txn_123');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'APPROVED', orderId: 1 }),
        });

        render(<CheckoutPage />);

        // Should show verifying state initially
        expect(screen.getByText('Verificando pago...')).toBeInTheDocument();
    });

    it('shows approved result after verification', async () => {
        mockSearchParams.set('id', 'txn_456');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'APPROVED', orderId: 5 }),
        });

        render(<CheckoutPage />);

        await waitFor(() => {
            expect(screen.getByText('¡Gracias por tu compra!')).toBeInTheDocument();
        });
    });

    it('shows declined result after verification', async () => {
        mockSearchParams.set('id', 'txn_789');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ status: 'DECLINED' }),
        });

        render(<CheckoutPage />);

        await waitFor(() => {
            expect(screen.getByText(/rechazado/)).toBeInTheDocument();
        });
    });

    it('shows error on verification failure', async () => {
        mockSearchParams.set('id', 'txn_err');
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        render(<CheckoutPage />);

        await waitFor(() => {
            expect(screen.getByText(/Error al verificar/)).toBeInTheDocument();
        });
    });
});
