import React from 'react';
import { render, screen, waitFor, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import DispatchConfirmPage from './page';

// Extiende el mock global de next/navigation añadiendo useParams
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: jest.fn(),
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '',
    useSearchParams: () => new URLSearchParams(),
    useParams: () => ({ token: 'tok-abc-123' }),
}));

const mockDispatch = {
    id: 1,
    dispatch_number: 'DSP-000042',
    status: 'EN_TRANSITO',
    sent_at: '2026-04-10T12:00:00Z',
    received_at: null,
    received_by: null,
    notes: 'Primera entrega',
    warehouse: {
        id: 10,
        name: 'Bodega Norte',
        customer_name: 'Retail Aliado',
    },
    items: [
        {
            id: 1,
            quantity: 3,
            reference: 'CAM-001',
            description: 'Camiseta básica',
            color: 'Azul',
            size: 'M',
        },
        {
            id: 2,
            quantity: 2,
            reference: 'CAM-002',
            description: null,
            color: 'Negro',
            size: 'L',
        },
    ],
};

const mockJsonResponse = (body: any, ok = true, status = 200) =>
    ({
        ok,
        status,
        json: async () => body,
        text: async () => (typeof body === 'string' ? body : JSON.stringify(body)),
        headers: { get: () => 'application/json' },
    }) as any;

describe('DispatchConfirmPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
    });

    afterEach(() => {
        delete (global as any).fetch;
    });

    it('shows loading state initially', () => {
        (global.fetch as jest.Mock).mockImplementation(() => new Promise(() => {}));
        render(<DispatchConfirmPage />);
        expect(screen.getByText('Cargando despacho...')).toBeInTheDocument();
    });

    it('renders dispatch details after successful fetch', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockJsonResponse(mockDispatch));

        render(<DispatchConfirmPage />);

        await waitFor(() => {
            expect(screen.getByText(/DSP-000042/)).toBeInTheDocument();
        });
        expect(screen.getByText('Retail Aliado')).toBeInTheDocument();
        expect(screen.getByText('Bodega Norte')).toBeInTheDocument();
        expect(screen.getByText(/CAM-001/)).toBeInTheDocument();
        expect(screen.getByText(/Primera entrega/)).toBeInTheDocument();
    });

    it('calls the backend endpoint with the token on mount', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockJsonResponse(mockDispatch));

        render(<DispatchConfirmPage />);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/consignment/dispatches/by-token/tok-abc-123'),
            );
        });
    });

    it('displays total units summary', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockJsonResponse(mockDispatch));
        render(<DispatchConfirmPage />);
        await waitFor(() => {
            // 2 referencias, 5 unidades totales
            expect(screen.getByText(/2 referencias.*5 unidades/)).toBeInTheDocument();
        });
    });

    it('renders confirmation form when EN_TRANSITO', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockJsonResponse(mockDispatch));
        render(<DispatchConfirmPage />);
        await waitFor(() => {
            expect(
                screen.getByRole('heading', { name: /confirmar recepción/i }),
            ).toBeInTheDocument();
        });
        expect(screen.getByPlaceholderText('Nombre de quien recibe')).toBeInTheDocument();
    });

    it('shows "already received" message when status is RECIBIDO', async () => {
        const received = {
            ...mockDispatch,
            status: 'RECIBIDO',
            received_at: '2026-04-11T15:00:00Z',
            received_by: 'Juan Pérez',
        };
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockJsonResponse(received));

        render(<DispatchConfirmPage />);

        await waitFor(() => {
            expect(screen.getByText('✓ Recepción confirmada')).toBeInTheDocument();
        });
        expect(screen.getByText(/Juan Pérez/)).toBeInTheDocument();
    });

    it('shows cancelled message when status is CANCELADO', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce(
            mockJsonResponse({ ...mockDispatch, status: 'CANCELADO' }),
        );
        render(<DispatchConfirmPage />);
        await waitFor(() => {
            expect(screen.getByText(/despacho fue cancelado/)).toBeInTheDocument();
        });
    });

    it('shows "not sent yet" message when status is PENDIENTE', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce(
            mockJsonResponse({ ...mockDispatch, status: 'PENDIENTE' }),
        );
        render(<DispatchConfirmPage />);
        await waitFor(() => {
            expect(screen.getByText(/aún no ha sido enviado/)).toBeInTheDocument();
        });
    });

    it('renders error screen when fetch fails', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            text: async () => 'Despacho no encontrado',
        });

        render(<DispatchConfirmPage />);

        await waitFor(() => {
            expect(screen.getByRole('heading', { name: 'Error' })).toBeInTheDocument();
        });
        expect(screen.getByText(/Despacho no encontrado/)).toBeInTheDocument();
    });

    it('disables submit button when received_by is empty', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockJsonResponse(mockDispatch));
        render(<DispatchConfirmPage />);

        const button = await screen.findByRole('button', { name: /confirmar recepción/i });
        expect(button).toBeDisabled();
    });

    it('enables submit and posts confirmation when name is entered', async () => {
        const user = userEvent.setup();
        // 1. GET inicial
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockJsonResponse(mockDispatch));
        // 2. POST confirm
        (global.fetch as jest.Mock).mockResolvedValueOnce(mockJsonResponse({ ok: true }));
        // 3. GET refresh post-confirm
        (global.fetch as jest.Mock).mockResolvedValueOnce(
            mockJsonResponse({
                ...mockDispatch,
                status: 'RECIBIDO',
                received_at: '2026-04-11T15:00:00Z',
                received_by: 'Ana Gómez',
            }),
        );

        render(<DispatchConfirmPage />);

        const input = await screen.findByPlaceholderText('Nombre de quien recibe');
        await user.type(input, 'Ana Gómez');

        // Check all item checkboxes to verify reception
        const checkboxes = screen.getAllByRole('checkbox');
        for (const cb of checkboxes) {
            await user.click(cb);
        }

        const button = screen.getByRole('button', { name: /confirmar recepción/i });
        expect(button).not.toBeDisabled();

        fireEvent.click(button);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/consignment/dispatches/by-token/tok-abc-123/confirm'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('Ana Gómez'),
                }),
            );
        });

        await waitFor(() => {
            expect(screen.getByText('✓ Recepción confirmada')).toBeInTheDocument();
        });
    });
});
