import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import LoginPage from '../../src/app/login/page';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn()
}));

// Mock global fetch
global.fetch = jest.fn() as jest.Mock;

describe('LoginPage', () => {
    const mockPush = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({
            push: mockPush,
        });
    });

    it('renders the login form', () => {
        render(<LoginPage />);

        expect(screen.getByRole('heading', { name: /Iniciar Sesión/i })).toBeInTheDocument();
        expect(screen.getByPlaceholderText(/Correo Electrónico/i)).toBeInTheDocument();
        expect(screen.getByRole('button', { name: /Enviar Código/i })).toBeInTheDocument();
    });

    it('handles successful API sign in request and redirects', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ message: 'OTP sent' })
        });

        render(<LoginPage />);

        const input = screen.getByPlaceholderText(/Correo Electrónico/i);
        const submitBtn = screen.getByRole('button', { name: /Enviar Código/i });

        await user.type(input, 'test@example.com');
        fireEvent.click(submitBtn);

        // Expect loading state text change
        expect(screen.getByRole('button', { name: /Enviando/i })).toBeInTheDocument();

        // Expect fetch to be called
        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/customer/login'),
                expect.objectContaining({
                    method: 'POST',
                    body: JSON.stringify({ email: 'test@example.com' })
                })
            );
        });

        // Expect redirect
        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/login/otp?email=test%40example.com');
        });
    });

    it('handles API error and displays message', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid email address' })
        });

        render(<LoginPage />);

        const input = screen.getByPlaceholderText(/Correo Electrónico/i);
        const submitBtn = screen.getByRole('button', { name: /Enviar Código/i });

        await user.type(input, 'wrong@test.com');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('Invalid email address')).toBeInTheDocument();
        });

        // Ensure no tracking progression
        expect(mockPush).not.toHaveBeenCalled();
    });

    it('handles generic network errors', async () => {
        const user = userEvent.setup();
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

        render(<LoginPage />);

        const input = screen.getByPlaceholderText(/Correo Electrónico/i);
        const submitBtn = screen.getByRole('button', { name: /Enviar Código/i });

        await user.type(input, 'error@test.com');
        fireEvent.click(submitBtn);

        await waitFor(() => {
            expect(screen.getByText('Network error')).toBeInTheDocument();
        });
    });
});
