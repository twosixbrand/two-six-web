import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OtpPage from '../../src/app/login/otp/page';

// Mock next/navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => mockSearchParams,
}));

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

describe('OtpPage', () => {
    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        jest.clearAllMocks();
        mockSearchParams.delete('email');
        originalFetch = global.fetch;
        global.fetch = jest.fn();
        // Mock sessionStorage
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: jest.fn().mockReturnValue(null),
                setItem: jest.fn(),
                removeItem: jest.fn(),
            },
            writable: true,
        });
    });

    afterEach(() => {
        global.fetch = originalFetch;
    });

    it('renders 6 digit inputs when email is present', () => {
        mockSearchParams.set('email', 'test@example.com');
        render(<OtpPage />);

        // There should be 6 individual input fields for OTP digits
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(6);

        // Each input should accept only 1 character
        inputs.forEach((input) => {
            expect(input).toHaveAttribute('maxLength', '1');
        });
    });

    it('gets email from URL params and displays it', () => {
        mockSearchParams.set('email', 'user@domain.com');
        render(<OtpPage />);

        expect(screen.getByText('Verificar Código')).toBeInTheDocument();
        expect(screen.getByText('user@domain.com')).toBeInTheDocument();
    });

    it('shows error when email is missing', () => {
        // email param not set
        render(<OtpPage />);

        expect(screen.getByText('Sesión Caducada')).toBeInTheDocument();
        expect(screen.getByText('Falta el correo electrónico.')).toBeInTheDocument();
        expect(screen.getByText('Volver a Solicitar')).toBeInTheDocument();
    });

    it('redirects to /login when "Volver a Solicitar" is clicked with no email', () => {
        render(<OtpPage />);

        fireEvent.click(screen.getByText('Volver a Solicitar'));
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('submits OTP with email (not document_number)', async () => {
        mockSearchParams.set('email', 'test@example.com');
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ accessToken: 'tok-123', customer: { name: 'John' } }),
        });

        render(<OtpPage />);

        // Type each digit into the 6 inputs
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: '1' } });
        fireEvent.change(inputs[1], { target: { value: '2' } });
        fireEvent.change(inputs[2], { target: { value: '3' } });
        fireEvent.change(inputs[3], { target: { value: '4' } });
        fireEvent.change(inputs[4], { target: { value: '5' } });
        fireEvent.change(inputs[5], { target: { value: '6' } });

        // Submit
        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/customer/verify-otp'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'test@example.com', otp: '123456' }),
                })
            );
        });

        // Should call login with token and customer data
        await waitFor(() => {
            expect(mockLogin).toHaveBeenCalledWith('tok-123', { name: 'John' });
        });
    });

    it('redirects to home after successful OTP verification', async () => {
        mockSearchParams.set('email', 'test@example.com');
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ accessToken: 'tok', customer: { name: 'A' } }),
        });

        render(<OtpPage />);

        const inputs = screen.getAllByRole('textbox');
        for (let i = 0; i < 6; i++) {
            fireEvent.change(inputs[i], { target: { value: String(i) } });
        }

        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });

    it('handles incorrect OTP error', async () => {
        mockSearchParams.set('email', 'test@example.com');
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'El código es incorrecto o ha expirado' }),
        });

        render(<OtpPage />);

        const inputs = screen.getAllByRole('textbox');
        for (let i = 0; i < 6; i++) {
            fireEvent.change(inputs[i], { target: { value: '0' } });
        }

        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(screen.getByText('El código es incorrecto o ha expirado')).toBeInTheDocument();
        });
    });

    it('shows error when submitting incomplete OTP', async () => {
        mockSearchParams.set('email', 'test@example.com');
        render(<OtpPage />);

        // Only fill 3 of 6 digits
        const inputs = screen.getAllByRole('textbox');
        fireEvent.change(inputs[0], { target: { value: '1' } });
        fireEvent.change(inputs[1], { target: { value: '2' } });
        fireEvent.change(inputs[2], { target: { value: '3' } });

        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(screen.getByText('Por favor, ingresa los 6 dígitos')).toBeInTheDocument();
        });

        // fetch should not have been called
        expect(global.fetch).not.toHaveBeenCalled();
    });

    it('handles network error gracefully', async () => {
        mockSearchParams.set('email', 'test@example.com');
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

        render(<OtpPage />);

        const inputs = screen.getAllByRole('textbox');
        for (let i = 0; i < 6; i++) {
            fireEvent.change(inputs[i], { target: { value: '9' } });
        }

        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(screen.getByText('Network failure')).toBeInTheDocument();
        });
    });
});
