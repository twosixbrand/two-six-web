import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../src/app/login/page';
import { getDepartments, getCities } from '@/services/locationApi';

// Mock next/navigation
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        prefetch: jest.fn(),
    }),
}));

// Mock locationApi
jest.mock('@/services/locationApi', () => ({
    getDepartments: jest.fn(),
    getCities: jest.fn(),
}));

// Mock Label component (shadcn/ui style)
jest.mock('@/components/ui/label', () => ({
    Label: ({ children, htmlFor }: { children: React.ReactNode; htmlFor?: string }) => (
        <label htmlFor={htmlFor}>{children}</label>
    ),
}));

describe('LoginPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        global.fetch = jest.fn();
        (getDepartments as jest.Mock).mockResolvedValue([
            { id: 1, name: 'Antioquia' },
            { id: 2, name: 'Cundinamarca' },
        ]);
        (getCities as jest.Mock).mockResolvedValue([
            { id: 1, name: 'Medellín', departmentId: 1 },
        ]);
    });

    it('renders the email input and welcome heading', async () => {
        render(<LoginPage />);
        // Wait for locations to load to avoid act(...) warning from useEffect
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());
        
        expect(screen.getByText(/Bienvenido/i)).toBeInTheDocument();
        expect(screen.getByPlaceholderText('Tu Correo Electrónico')).toBeInTheDocument();
    });

    it('submits email and redirects to OTP if user exists', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'User found' }),
        });

        render(<LoginPage />);
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'test@example.com');
        await user.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/login/otp'));
        });
    });

    it('shows registration form when API returns 404', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'no encontramos tu cuenta' }),
        });

        render(<LoginPage />);
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'new@example.com');
        await user.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(screen.getByText('Completa tu Registro')).toBeInTheDocument();
            expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
        });
    });

    it('validates privacy policy checkbox before registration', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'no encontramos tu cuenta' }),
        });

        render(<LoginPage />);
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'new@example.com');
        await user.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => screen.getByText('Completa tu Registro'));

        // Fill other required fields to avoid browser validation blocking
        await user.type(screen.getByLabelText(/Nombre Completo/i), 'Test User');
        await user.type(screen.getByLabelText(/Número de Documento/i), '12345');
        await user.type(screen.getByLabelText(/Teléfono/i), '3101234567');

        // Don't check privacy policy
        await user.click(screen.getByRole('button', { name: /Crear Cuenta y Enviar Código/i }));

        await waitFor(() => {
            expect(screen.getByText(/Debes autorizar el tratamiento de datos/i)).toBeInTheDocument();
        });
    });

    it('shows error if document number is missing (custom validation)', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'no encontramos tu cuenta' }),
        });

        render(<LoginPage />);
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'new@example.com');
        await user.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => screen.getByText('Completa tu Registro'));

        await user.type(screen.getByLabelText(/Nombre Completo/i), 'Test User');
        await user.type(screen.getByLabelText(/Teléfono/i), '3101234567');
        
        // Type a space to bypass HTML5 "required" but trigger our .trim() check
        await user.type(screen.getByLabelText(/Número de Documento/i), ' ');
        
        // Accept privacy
        await user.click(screen.getByRole('checkbox')); 

        await user.click(screen.getByRole('button', { name: /Crear Cuenta y Enviar Código/i }));

        await waitFor(() => {
            expect(screen.getByText(/El número de documento es obligatorio/i)).toBeInTheDocument();
        });
    });

    it('updates cities when department is changed', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            json: async () => ({ message: 'not found' }),
        });

        render(<LoginPage />);
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'new@example.com');
        await user.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => screen.getByText('Completa tu Registro'));

        const departmentSelect = screen.getByLabelText(/Departamento/i);
        await user.selectOptions(departmentSelect, '1'); // Antioquia

        await waitFor(() => {
            expect(getCities).toHaveBeenCalledWith(1);
        });

        const citySelect = screen.getByLabelText(/Ciudad \/ Municipio/i);
        await waitFor(() => expect(citySelect).not.toBeDisabled());
        await user.selectOptions(citySelect, '1'); // Medellín
    });

    it('handles successful registration', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ message: 'not found' }),
            })
            .mockResolvedValueOnce({
                ok: true,
                json: async () => ({ message: 'Registered' }),
            });

        render(<LoginPage />);
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'new@example.com');
        await user.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => screen.getByText('Completa tu Registro'));

        await user.type(screen.getByLabelText(/Nombre Completo/i), 'Test User');
        await user.type(screen.getByLabelText(/Número de Documento/i), '12345');
        await user.type(screen.getByLabelText(/Teléfono/i), '3101234567');
        await user.click(screen.getByRole('checkbox'));

        await user.click(screen.getByRole('button', { name: /Crear Cuenta y Enviar Código/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith(expect.stringContaining('/login/otp'));
        });
    });

    it('handles registration API error', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock)
            .mockResolvedValueOnce({
                ok: false,
                status: 404,
                json: async () => ({ message: 'not found' }),
            })
            .mockResolvedValueOnce({
                ok: false,
                json: async () => ({ message: 'Email already registered' }),
            });

        render(<LoginPage />);
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'dup@example.com');
        await user.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => screen.getByText('Completa tu Registro'));

        await user.type(screen.getByLabelText(/Nombre Completo/i), 'Dup User');
        await user.type(screen.getByLabelText(/Número de Documento/i), '999');
        await user.type(screen.getByLabelText(/Teléfono/i), '3001111111');
        await user.click(screen.getByRole('checkbox'));

        await user.click(screen.getByRole('button', { name: /Crear Cuenta y Enviar Código/i }));

        await waitFor(() => {
            expect(screen.getByText('Email already registered')).toBeInTheDocument();
        });
    });

    it('handles generic login API error', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Bad request' }),
        });

        render(<LoginPage />);
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'error@test.com');
        await user.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(screen.getByText('Bad request')).toBeInTheDocument();
        });
    });

    it('handles network error on login', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<LoginPage />);
        await waitFor(() => expect(screen.queryByRole('status')).not.toBeInTheDocument());

        await user.type(screen.getByPlaceholderText('Tu Correo Electrónico'), 'error@test.com');
        await user.click(screen.getByRole('button', { name: /Enviar Código de Acceso/i }));

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });
});
