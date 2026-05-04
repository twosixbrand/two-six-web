import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import CheckoutForm from './CheckoutForm';
import { CartProvider } from '@/context/CartContext';
import { AuthProvider } from '@/context/AuthContext';
import * as locationApi from '@/services/locationApi';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3050';

// Polyfill atob and btoa for JWT decoding in AuthContext
if (typeof window.atob === 'undefined') {
    window.atob = (str: string) => Buffer.from(str, 'base64').toString('binary');
}
if (typeof window.btoa === 'undefined') {
    window.btoa = (str: string) => Buffer.from(str, 'binary').toString('base64');
}

// Mock locationApi
jest.mock('@/services/locationApi', () => ({
    getDepartments: jest.fn(),
    getCities: jest.fn(),
}));

// Mock useWompiPayment
const mockStartPaymentFlow = jest.fn();
jest.mock('@/hooks/useWompiPayment', () => ({
    useWompiPayment: () => ({
        startPaymentFlow: mockStartPaymentFlow,
        loadingPayment: false,
    }),
}));

const mockCartItems = [
    {
        id: 1,
        name: 'Test Product',
        price: 100000,
        quantity: 1,
        gender: 'Hombre',
        clothingSize: {
            size: { name: 'M' },
            clothingColor: {
                color: { name: 'Rojo' },
                image_url: 'http://image.com',
            }
        }
    }
];

jest.mock('@/hooks/useWompiPayment', () => ({
    useWompiPayment: () => ({
        startPaymentFlow: mockStartPaymentFlow,
        loadingPayment: false,
    }),
}));

const renderWithProviders = (ui: React.ReactElement) => {
    return render(
        <AuthProvider>
            <CartProvider>
                {ui}
            </CartProvider>
        </AuthProvider>
    );
};

describe('CheckoutForm', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
        (locationApi.getDepartments as jest.Mock).mockResolvedValue([
            { id: 1, name: 'Antioquia' }
        ]);
        (locationApi.getCities as jest.Mock).mockResolvedValue([
            { id: 10, name: 'Medellín', shipping_cost: 10000 }
        ]);
        
        window.localStorage.clear();
        // Mock gtag
        (window as any).gtag = jest.fn();

        // Default fetch mock
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({}),
        });

        // Ensure cart has items for CheckoutForm to render
        window.localStorage.setItem('shopping-cart', JSON.stringify(mockCartItems));
    });

    it('renders initial state and loads departments', async () => {
        renderWithProviders(<CheckoutForm />);

        expect(screen.getByText('Método de Entrega')).toBeInTheDocument();
        await waitFor(() => {
            expect(screen.getByText('Antioquia')).toBeInTheDocument();
        });

        expect(screen.getAllByText(/Realizar Pago/i).length).toBeGreaterThan(0);
    });

    it('toggles delivery method and updates shipping cost', async () => {
        renderWithProviders(<CheckoutForm />);

        await waitFor(() => screen.getByText('Antioquia'));

        // Select department
        fireEvent.change(screen.getByLabelText(/Departamento/i), { target: { value: '1' } });
        
        await waitFor(() => screen.getByText('Medellín'));
        
        // Select city
        fireEvent.change(screen.getByLabelText(/Ciudad/i), { target: { value: '10' } });

        // Total should show shipping cost
        await waitFor(() => {
            const totalElement = screen.getAllByText(/Total a Pagar Hoy/i)[0].nextElementSibling;
            expect(totalElement).toHaveTextContent(/110.000/);
        });

        // Switch to Pickup
        fireEvent.click(screen.getByText('Recoger en Punto'));
        
        await waitFor(() => {
            const totalElement = screen.getAllByText(/Total a Pagar Hoy/i)[0].nextElementSibling;
            expect(totalElement).toHaveTextContent(/100.000/);
        });
    });

    it('applies discount code', async () => {
        global.fetch = jest.fn().mockResolvedValueOnce({
            ok: true,
            json: async () => ({ code: 'DESC10', percentage: 10, freeShipping: false }),
        });

        renderWithProviders(<CheckoutForm />);

        // Need email to apply discount
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@test.com' } });
        
        const discountInput = screen.getByPlaceholderText(/Ingresa tu código/i);
        fireEvent.change(discountInput, { target: { value: 'DESC10' } });
        fireEvent.click(screen.getByText('Aplicar'));

        await waitFor(() => {
            expect(screen.getByText(/¡Código DESC10 aplicado!/i)).toBeInTheDocument();
        });
    });

    it('validates terms and conditions before submission', async () => {
        renderWithProviders(<CheckoutForm />);

        await waitFor(() => screen.getByText('Antioquia'));

        const submitBtn = screen.getAllByRole('button', { name: /Realizar Pago/i })[0];
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText(/Términos y Condiciones/i)).toBeInTheDocument();
        });
    });

    it('submits form correctly', async () => {
        renderWithProviders(<CheckoutForm />);

        await waitFor(() => screen.getByText('Antioquia'));

        // Fill required fields
        fireEvent.change(screen.getByLabelText(/Número de Documento/i), { target: { value: '123456' } });
        fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'John Doe' } });
        fireEvent.change(screen.getByLabelText(/Teléfono/i), { target: { value: '3001234567' } });
        fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'john@doe.com' } });
        
        fireEvent.change(screen.getByLabelText(/Departamento/i), { target: { value: '1' } });
        await waitFor(() => screen.getByText('Medellín'));
        fireEvent.change(screen.getByLabelText(/Ciudad/i), { target: { value: '10' } });

        // Select "Recoger en Punto"
        fireEvent.click(screen.getByText('Recoger en Punto'));
        
        // Accept terms
        fireEvent.click(screen.getByRole('checkbox'));

        const submitBtn = screen.getAllByRole('button', { name: /Realizar Pago/i })[0];
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(mockStartPaymentFlow).toHaveBeenCalled();
        });
    });

    it('prefills data for logged in user', async () => {
        const mockCustomer = {
            id: 1,
            name: 'Stored User',
            email: 'stored@user.com',
            document_number: '987654',
            current_phone_number: '3119876543'
        };

        // Create a fake valid JWT to pass isTokenExpired check
        const futureExp = Math.floor(Date.now() / 1000) + 3600;
        const header = btoa(JSON.stringify({ alg: 'HS256', typ: 'JWT' }));
        const payload = btoa(JSON.stringify({ exp: futureExp }));
        const fakeJwt = `${header}.${payload}.signature`;

        window.localStorage.setItem('customerData', JSON.stringify({ id: 1, name: 'Stored User' }));
        window.localStorage.setItem('customerToken', fakeJwt);
        
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: true,
                json: async () => mockCustomer,
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => [], // No addresses
            });

        renderWithProviders(<CheckoutForm />);

        await waitFor(() => {
            expect(screen.getByLabelText(/Nombre Completo/i)).toHaveValue('Stored User');
            expect(screen.getByLabelText(/Número de Documento/i)).toHaveValue('987654');
        });
    });

    it('handles customer fetch error gracefully', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        window.localStorage.setItem('customerData', JSON.stringify({ id: 1, name: 'Test' }));
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Fetch failed'));

        renderWithProviders(<CheckoutForm />);
        
        await waitFor(() => {
            expect(screen.getByText('Método de Entrega')).toBeInTheDocument();
        });
        consoleSpy.mockRestore();
    });

    it('navigates to login when clicking login banner button', async () => {
        window.localStorage.setItem('shopping-cart', JSON.stringify(mockCartItems));
        renderWithProviders(<CheckoutForm />);
        
        // Wait for locations to settle to avoid act(...) warning
        await waitFor(() => screen.getByText('Antioquia'));
        
        const loginBtn = screen.getByRole('button', { name: /Iniciar Sesión/i });
        fireEvent.click(loginBtn);
        
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('handles address fetch error', async () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        window.localStorage.setItem('customerData', JSON.stringify({ id: 1, name: 'Test' }));
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({ ok: true, json: async () => ({ id: 1 }) }) // Profile
            .mockRejectedValueOnce(new Error('Address fetch failed'));

        renderWithProviders(<CheckoutForm />);
        
        await waitFor(() => {
            expect(screen.getByText('Método de Entrega')).toBeInTheDocument();
        });
        expect(consoleSpy).toHaveBeenCalled();
        consoleSpy.mockRestore();
    });

    it('calculates free shipping for high value orders', async () => {
        const expensiveCart = [
            {
                id: 1,
                name: 'Expensive Suit',
                price: 200000,
                quantity: 1,
                clothingSize: { size: { name: 'M' }, clothingColor: { color: { name: 'Negro' } } }
            }
        ];
        window.localStorage.setItem('shopping-cart', JSON.stringify(expensiveCart));

        renderWithProviders(<CheckoutForm />);

        await waitFor(() => screen.getByText('Antioquia'));
        
        // Select department and city
        fireEvent.change(screen.getByLabelText(/Departamento/i), { target: { value: '1' } });
        await waitFor(() => screen.getByText('Medellín'));
        fireEvent.change(screen.getByLabelText(/Ciudad/i), { target: { value: '10' } });

        // Should show "¡Envío Gratis!"
        await waitFor(() => {
            expect(screen.getAllByText(/¡Envío Gratis!/i).length).toBeGreaterThan(0);
        });
    });
});
