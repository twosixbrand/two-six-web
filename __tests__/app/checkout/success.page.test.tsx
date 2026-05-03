import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import SuccessPage from '../../../src/app/checkout/success/page';

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

// Mock next/image

// Mock next/script
jest.mock('next/script', () => ({
    __esModule: true,
    default: (props: any) => <script {...props} />,
}));

const mockOrder = {
    id: 123,
    order_reference: 'TS-12345',
    total_payment: 105000,
    shipping_cost: 5000,
    shipping_address: 'Calle Falsa 123',
    customer: {
        name: 'John Doe',
        email: 'john@example.com',
        current_phone_number: '3001234567',
    },
    orderItems: [
        {
            id: 1,
            product_name: 'Product 1',
            quantity: 2,
            unit_price: 50000,
            size: 'M',
            color: 'Red',
            product: { image_url: '/img1.jpg' }
        }
    ]
};

describe('SuccessPage', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams.delete('orderId');
        mockSearchParams.delete('id');
        mockSearchParams.delete('transactionId');
        
        originalFetch = global.fetch;
        global.fetch = jest.fn();
        
        // Mock sessionStorage
        const mockSessionStorage = (() => {
            let store: any = {};
            return {
                getItem: (key: string) => store[key] || null,
                setItem: (key: string, value: string) => { store[key] = value.toString(); },
                clear: () => { store = {}; }
            };
        })();
        Object.defineProperty(window, 'sessionStorage', { value: mockSessionStorage, writable: true });
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('renders loading state initially', async () => {
        mockSearchParams.set('orderId', '123');
        (global.fetch as jest.Mock).mockReturnValue(new Promise(() => {})); // Never resolves

        render(<SuccessPage />);
        expect(screen.getByText(/Cargando detalles/i)).toBeInTheDocument();
    });

    it('renders error when no order information is provided', async () => {
        render(<SuccessPage />);
        await waitFor(() => {
            expect(screen.getByText('No se encontró información de la orden.')).toBeInTheDocument();
        });
    });

    it('fetches and displays order details by orderId', async () => {
        mockSearchParams.set('orderId', '123');
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockOrder,
        });

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText(/¡Gracias por tu compra!/i)).toBeInTheDocument();
            expect(screen.getByText(/TS-12345/)).toBeInTheDocument();
            expect(screen.getByText(/John Doe/)).toBeInTheDocument();
            expect(screen.getByText(/Product 1/)).toBeInTheDocument();
        });

        expect(mockClearCart).toHaveBeenCalledTimes(1);
    });

    it('verifies payment first if transactionId is present', async () => {
        mockSearchParams.set('transactionId', 'txn_789');
        mockSearchParams.set('orderId', '123');

        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ status: 'APPROVED', orderId: 123 }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockOrder,
            });

        render(<SuccessPage />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/order/verify-payment'),
                expect.objectContaining({ method: 'POST' })
            );
        });

        await waitFor(() => {
            expect(screen.getByText(/TS-12345/)).toBeInTheDocument();
        });
    });

    it('shows error if payment verification fails', async () => {
        mockSearchParams.set('transactionId', 'txn_fail');

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'DECLINED' }),
        });

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText(/El pago no fue aprobado/i)).toBeInTheDocument();
            expect(screen.getByText(/DECLINED/)).toBeInTheDocument();
        });
    });

    it('shows error if verify-payment fetch rejects', async () => {
        mockSearchParams.set('transactionId', 'txn_reject');

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText(/Error verificando el pago/i)).toBeInTheDocument();
        });
    });

    it('renders pickup information if delivery_method is PICKUP', async () => {
        mockSearchParams.set('orderId', '123');
        const pickupOrder = {
            ...mockOrder,
            delivery_method: 'PICKUP',
            pickup_pin: '9876'
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => pickupOrder,
        });

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText('Punto de Retiro Seleccionado')).toBeInTheDocument();
            expect(screen.getByText('9876')).toBeInTheDocument();
            expect(screen.getByText(/URB Guadalcanal/)).toBeInTheDocument();
        });
    });

    it('renders COD information if payment_method is WOMPI_COD', async () => {
        mockSearchParams.set('orderId', '123');
        const codOrder = {
            ...mockOrder,
            payment_method: 'WOMPI_COD',
            cod_amount: 150000
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => codOrder,
        });

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText('Valor Pagado Hoy (Envío)')).toBeInTheDocument();
            expect(screen.getByText('A Pagar Contra Entrega (PCE):')).toBeInTheDocument();
            expect(screen.getByText('$150,000')).toBeInTheDocument();
        });
    });

    it('renders DIAN invoicing details if present', async () => {
        mockSearchParams.set('orderId', '123');
        const dianOrder = {
            ...mockOrder,
            dianEInvoicing: [{
                document_number: 'SETT123',
                cufe_code: 'CUFE-ABC-123',
                qr_code: 'data:image/png;base64,qr',
                status: 'PROCESSED'
            }]
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => dianOrder,
        });

        render(<SuccessPage />);

        await waitFor(() => {
            expect(screen.getByText('Factura Electrónica DIAN')).toBeInTheDocument();
            expect(screen.getByText(/SETT123/)).toBeInTheDocument();
            expect(screen.getByText(/CUFE-ABC-123/)).toBeInTheDocument();
            expect(screen.getByAltText('QR Factura DIAN')).toBeInTheDocument();
        });
    });
});
