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

    it('renders OTP input field', () => {
        mockSearchParams.set('email', 'test@example.com');
        render(<OtpPage />);
        const input = screen.getByPlaceholderText('000000');
        expect(input).toBeInTheDocument();
    });

    it('calls API on form submit', async () => {
        mockSearchParams.set('email', 'test@example.com');
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ accessToken: 'token', customer: { name: 'Test' } }),
        });

        render(<OtpPage />);

        const input = screen.getByPlaceholderText('000000');
        fireEvent.change(input, { target: { value: '123456' } });

        const submitBtn = screen.getByText('Verificar');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledTimes(1);
        });
    });

    it('shows error on API failure', async () => {
        mockSearchParams.set('email', 'test@example.com');
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Código inválido' }),
        });

        render(<OtpPage />);

        const input = screen.getByPlaceholderText('000000');
        fireEvent.change(input, { target: { value: '000000' } });
        fireEvent.click(screen.getByText('Verificar'));

        await waitFor(() => {
            expect(screen.getByText('Código inválido')).toBeInTheDocument();
        });
    });

    it('shows generic error on network failure', async () => {
        mockSearchParams.set('email', 'test@example.com');
        global.fetch = jest.fn().mockRejectedValue(new Error('Network error'));

        render(<OtpPage />);

        fireEvent.change(screen.getByPlaceholderText('000000'), { target: { value: '111111' } });
        fireEvent.click(screen.getByText('Verificar'));

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });
});
