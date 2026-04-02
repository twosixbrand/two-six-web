import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../src/app/login/page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

// Mock location API so the useEffect doesn't make real calls
jest.mock('@/services/locationApi', () => ({
    getDepartments: jest.fn().mockResolvedValue([
        { id: 1, name: 'Antioquia' },
        { id: 2, name: 'Cundinamarca' },
    ]),
    getCities: jest.fn().mockResolvedValue([
        { id: 10, name: 'Medellín', id_department: 1, active: true, shipping_cost: 10000 },
    ]),
}));

// Mock the shadcn Label component
jest.mock('@/components/ui/label', () => ({
    Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

describe('LoginPage', () => {
    const mockPush = jest.fn();
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        jest.clearAllMocks();
        originalFetch = global.fetch;
        global.fetch = jest.fn();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('renders the email input (not document_number)', () => {
        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('Tu Correo Electrónico');
        expect(emailInput).toBeInTheDocument();
        expect(emailInput).toHaveAttribute('type', 'email');
        expect(emailInput).toHaveAttribute('name', 'email');

        // document_number should NOT be visible initially
        expect(screen.queryByLabelText(/Número de Documento/i)).not.toBeInTheDocument();
    });

    it('renders Bienvenido heading and submit button', () => {
        render(<LoginPage />);

        expect(screen.getByText('Bienvenido')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Enviar Código de Acceso/i })).toBeInTheDocument();
    });

    it('submits email to /api/auth/customer/login', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'OTP sent' }),
        });

        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('Tu Correo Electrónico');
        await user.type(emailInput, 'test@example.com');
        fireEvent.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/customer/login'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'test@example.com' }),
                })
            );
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login/otp?email=test%40example.com');
        });
    });

    it('shows registration form when API returns 404 (user not found)', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'no encontramos tu cuenta' }),
        });

        render(<LoginPage />);

        const emailInput = screen.getByPlaceholderText('Tu Correo Electrónico');
        await user.type(emailInput, 'new@example.com');
        fireEvent.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(screen.getByText('Completa tu Registro')).toBeInTheDocument();
        });

        // Error message shown
        expect(screen.getByText(/No tienes una cuenta aún/i)).toBeInTheDocument();
    });

    it('registration form has name, document type selector, document number, phone, and email is disabled', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'no encontramos tu cuenta' }),
        });

        render(<LoginPage />);

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'new@example.com');
        fireEvent.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(screen.getByText('Completa tu Registro')).toBeInTheDocument();
        });

        // Name field
        expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();

        // Document type selector
        expect(screen.getByLabelText(/Tipo de Documento/i)).toBeInTheDocument();

        // Document number field
        expect(screen.getByLabelText(/Número de Documento/i)).toBeInTheDocument();

        // Phone field
        expect(screen.getByLabelText(/Teléfono/i)).toBeInTheDocument();

        // Email input should be disabled in registration mode
        const emailInput = screen.getByPlaceholderText('Tu Correo Electrónico');
        expect(emailInput).toBeDisabled();

        // Submit button text changes
        expect(screen.getByRole('button', { name: /Crear Cuenta y Enviar Código/i })).toBeInTheDocument();
    });

    it('validates privacy policy checkbox before registration submit', async () => {
        const user = userEvent.setup();
        // First call: 404 to trigger registration
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'no encontramos tu cuenta' }),
        });

        render(<LoginPage />);

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'new@example.com');
        fireEvent.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(screen.getByText('Completa tu Registro')).toBeInTheDocument();
        });

        // Fill required fields but do NOT check privacy policy
        await user.type(screen.getByLabelText(/Nombre Completo/i), 'Test User');
        await user.type(screen.getByLabelText(/Número de Documento/i), '123456789');
        await user.type(screen.getByLabelText(/Teléfono/i), '3101234567');

        fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta y Enviar Código/i }));

        await waitFor(() => {
            expect(screen.getByText(/Debes autorizar el tratamiento de datos/i)).toBeInTheDocument();
        });

        // Registration endpoint should NOT have been called
        expect(global.fetch).toHaveBeenCalledTimes(1); // Only the initial login call
    });

    it('submits registration data to /api/auth/customer/register', async () => {
        const user = userEvent.setup();
        // First call: 404 to trigger registration
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ message: 'no encontramos tu cuenta' }),
            })
            // Second call: register success
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Registered' }),
            });

        render(<LoginPage />);

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'new@example.com');
        fireEvent.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(screen.getByText('Completa tu Registro')).toBeInTheDocument();
        });

        // Fill registration fields
        await user.type(screen.getByLabelText(/Nombre Completo/i), 'Test User');
        await user.type(screen.getByLabelText(/Número de Documento/i), '123456789');
        await user.type(screen.getByLabelText(/Teléfono/i), '3101234567');

        // Check privacy policy
        const privacyCheckbox = screen.getByRole('checkbox');
        fireEvent.click(privacyCheckbox);

        fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta y Enviar Código/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/customer/register'),
                expect.objectContaining({
                    method: 'POST',
                    body: expect.stringContaining('"email":"new@example.com"'),
                })
            );
        });

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login/otp?email=new%40example.com');
        });
    });

    it('handles registration API error', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ message: 'no encontramos' }),
            })
            .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Email already registered' }),
            });

        render(<LoginPage />);

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'dup@example.com');
        fireEvent.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(screen.getByText('Completa tu Registro')).toBeInTheDocument();
        });

        await user.type(screen.getByLabelText(/Nombre Completo/i), 'Dup User');
        await user.type(screen.getByLabelText(/Número de Documento/i), '999');
        await user.type(screen.getByLabelText(/Teléfono/i), '3001111111');
        fireEvent.click(screen.getByRole('checkbox'));

        fireEvent.click(screen.getByRole('button', { name: /Crear Cuenta y Enviar Código/i }));

        await waitFor(() => {
            expect(screen.getByText('Email already registered')).toBeInTheDocument();
        });

        expect(mockPush).not.toHaveBeenCalled();
    });

    it('handles generic network error on login', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<LoginPage />);

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'error@test.com');
        fireEvent.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });
});
