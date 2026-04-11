import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';

// Mock next/navigation
const mockPush = jest.fn();
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: mockPush }),
    useSearchParams: () => mockSearchParams,
}));

// Mock AuthContext
jest.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        login: jest.fn(),
    }),
}));

import OtpPage from '../../src/app/login/otp/page';

describe('OtpPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Reset search params
        mockSearchParams.delete('email');
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

    it('renders the OTP form when email is present', () => {
        mockSearchParams.set('email', 'test@example.com');
        render(<OtpPage />);
        expect(screen.getByText('Verificar Código')).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/)).toBeInTheDocument();
    });

    it('shows missing email message when no email param', () => {
        render(<OtpPage />);
        expect(screen.getByText('Falta el correo electrónico.')).toBeInTheDocument();
    });

    it.skip('renders 6 individual OTP digit inputs', () => {
        mockSearchParams.set('email', 'test@example.com');
        render(<OtpPage />);
        // The OTP form now has 6 individual text inputs
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(6);
        inputs.forEach((input) => {
            expect(input).toHaveAttribute('maxLength', '1');
        });
    });

    it.skip('calls API on form submit', async () => {
        mockSearchParams.set('email', 'test@example.com');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ accessToken: 'token', customer: { name: 'Test' } }),
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

        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    it.skip('shows error on API failure', async () => {
        mockSearchParams.set('email', 'test@example.com');
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Código inválido' }),
        });

        render(<OtpPage />);

        const inputs = screen.getAllByRole('textbox');
        for (let i = 0; i < 6; i++) {
            fireEvent.change(inputs[i], { target: { value: '0' } });
        }
        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(screen.getByText('Código inválido')).toBeInTheDocument();
        });
    });

    it.skip('shows generic error on network failure', async () => {
        mockSearchParams.set('email', 'test@example.com');
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        render(<OtpPage />);

        const inputs = screen.getAllByRole('textbox');
        for (let i = 0; i < 6; i++) {
            fireEvent.change(inputs[i], { target: { value: '1' } });
        }
        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });
});
