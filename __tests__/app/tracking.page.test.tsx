import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import TrackingPage from '../../src/app/tracking/page';

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
    useSearchParams: () => mockSearchParams,
}));

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => <img {...props} />,
}));

// Mock TrackingTimeline component to keep tests focused on tracking page logic
jest.mock('@/components/TrackingTimeline', () => ({
    TrackingTimeline: ({ order }: any) => (
        <div data-testid="tracking-timeline">Timeline for {order.order_reference}</div>
    ),
}));

const makeOrder = (overrides: Record<string, any> = {}) => ({
    id: 1,
    order_reference: 'TS-260310-4821',
    order_date: '2026-03-10T12:00:00Z',
    status: 'Confirmado',
    total_payment: 250000,
    shipping_cost: 15000,
    orderItems: [
        {
            id: 100,
            product_name: 'Camiseta Two Six',
            color: 'Negro',
            size: 'M',
            quantity: 2,
            unit_price: 117500,
            product: {
                clothingSize: {
                    clothingColor: {
                        imageClothing: [{ image_url: 'https://example.com/img.jpg' }],
                    },
                },
            },
        },
    ],
    ...overrides,
});

describe('TrackingPage', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams.delete('ref');
        mockSearchParams.delete('email');
        originalFetch = global.fetch;
        global.fetch = jest.fn();
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('renders the tracking form', () => {
        render(<TrackingPage />);

        expect(screen.getByText('Rastrea tu Pedido')).toBeInTheDocument();
        expect(screen.getByLabelText(/Referencia del Pedido/i)).toBeInTheDocument();
        expect(screen.getByLabelText(/Correo Electrónico/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Rastrear/i })).toBeInTheDocument();
    });

    it('fetches and displays order on form submit', async () => {
        const order = makeOrder();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => order,
        });

        render(<TrackingPage />);

        fireEvent.change(screen.getByLabelText(/Referencia del Pedido/i), {
            target: { value: 'TS-260310-4821' },
        });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), {
            target: { value: 'test@example.com' },
        });
        fireEvent.click(screen.getByRole('button', { name: /Rastrear/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/order/track'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ orderReference: 'TS-260310-4821', email: 'test@example.com' }),
                })
            );
        });

        await waitFor(() => {
            expect(screen.getByText(/Orden TS-260310-4821/)).toBeInTheDocument();
        });
    });

    it('shows pickup_pin when delivery_method is PICKUP', async () => {
        const order = makeOrder({
            delivery_method: 'PICKUP',
            pickup_status: 'READY',
            pickup_pin: '8472',
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => order,
        });

        render(<TrackingPage />);

        fireEvent.change(screen.getByLabelText(/Referencia del Pedido/i), { target: { value: 'REF1' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
        fireEvent.click(screen.getByRole('button', { name: /Rastrear/i }));

        await waitFor(() => {
            expect(screen.getByText('Información de Recogida')).toBeInTheDocument();
        });

        // PIN should be visible
        expect(screen.getByText('8472')).toBeInTheDocument();
        expect(screen.getByText(/Tu PIN de Retiro/i)).toBeInTheDocument();
    });

    it('shows shipping info when delivery_method is SHIPPING', async () => {
        const order = makeOrder({
            delivery_method: 'SHIPPING',
            shipments: [
                {
                    id: 5,
                    guide_number: 'GN-999',
                    status: 'En tránsito',
                    createdAt: '2026-03-11T00:00:00Z',
                    shippingProvider: { name: 'Coordinadora' },
                    trackingHistory: [
                        { status: 'En camino', location: 'Bogotá', update_date: '2026-03-12T00:00:00Z' },
                    ],
                },
            ],
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => order,
        });

        render(<TrackingPage />);

        fireEvent.change(screen.getByLabelText(/Referencia del Pedido/i), { target: { value: 'REF2' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
        fireEvent.click(screen.getByRole('button', { name: /Rastrear/i }));

        await waitFor(() => {
            expect(screen.getByText('Detalles del Envío')).toBeInTheDocument();
        });

        expect(screen.getByText('Coordinadora')).toBeInTheDocument();
        expect(screen.getByText('GN-999')).toBeInTheDocument();
        expect(screen.getByText('En tránsito')).toBeInTheDocument();
        expect(screen.getByText(/En camino/)).toBeInTheDocument();

        // Should NOT show pickup info
        expect(screen.queryByText('Información de Recogida')).not.toBeInTheDocument();
    });

    it('shows READY pickup status badge', async () => {
        const order = makeOrder({
            delivery_method: 'PICKUP',
            pickup_status: 'READY',
            pickup_pin: '1111',
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => order,
        });

        render(<TrackingPage />);

        fireEvent.change(screen.getByLabelText(/Referencia del Pedido/i), { target: { value: 'R' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
        fireEvent.click(screen.getByRole('button', { name: /Rastrear/i }));

        await waitFor(() => {
            expect(screen.getByText(/Listo para Recoger/i)).toBeInTheDocument();
        });
    });

    it('shows COLLECTED pickup status badge', async () => {
        const order = makeOrder({
            delivery_method: 'PICKUP',
            pickup_status: 'COLLECTED',
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => order,
        });

        render(<TrackingPage />);

        fireEvent.change(screen.getByLabelText(/Referencia del Pedido/i), { target: { value: 'R' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
        fireEvent.click(screen.getByRole('button', { name: /Rastrear/i }));

        await waitFor(() => {
            expect(screen.getByText(/Entregado en Tienda/i)).toBeInTheDocument();
        });
    });

    it('shows pending pickup status badge when pickup_status is neither READY nor COLLECTED', async () => {
        const order = makeOrder({
            delivery_method: 'PICKUP',
            pickup_status: 'PENDING',
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => order,
        });

        render(<TrackingPage />);

        fireEvent.change(screen.getByLabelText(/Referencia del Pedido/i), { target: { value: 'R' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
        fireEvent.click(screen.getByRole('button', { name: /Rastrear/i }));

        await waitFor(() => {
            expect(screen.getByText(/En preparación/i)).toBeInTheDocument();
        });
    });

    it('shows error message on API failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Orden no encontrada' }),
        });

        render(<TrackingPage />);

        fireEvent.change(screen.getByLabelText(/Referencia del Pedido/i), { target: { value: 'INVALID' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
        fireEvent.click(screen.getByRole('button', { name: /Rastrear/i }));

        await waitFor(() => {
            expect(screen.getByText('Orden no encontrada')).toBeInTheDocument();
        });
    });

    it('shows no shipping info message when SHIPPING but no shipments', async () => {
        const order = makeOrder({
            delivery_method: 'SHIPPING',
            shipments: [],
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => order,
        });

        render(<TrackingPage />);

        fireEvent.change(screen.getByLabelText(/Referencia del Pedido/i), { target: { value: 'R' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
        fireEvent.click(screen.getByRole('button', { name: /Rastrear/i }));

        await waitFor(() => {
            expect(screen.getByText(/Aún no hay información de envío disponible/i)).toBeInTheDocument();
        });
    });

    it('displays order products and totals', async () => {
        const order = makeOrder({
            delivery_method: 'SHIPPING',
            shipments: [],
        });
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => order,
        });

        render(<TrackingPage />);

        fireEvent.change(screen.getByLabelText(/Referencia del Pedido/i), { target: { value: 'R' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'a@b.com' } });
        fireEvent.click(screen.getByRole('button', { name: /Rastrear/i }));

        await waitFor(() => {
            expect(screen.getByText('Camiseta Two Six')).toBeInTheDocument();
        });

        expect(screen.getByText(/Negro \/ M x 2/)).toBeInTheDocument();
        expect(screen.getByText('Productos')).toBeInTheDocument();
    });
});
