import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import OtpPage from '../../src/app/login/otp/page';

// Mock next/navigation
const mockPush = jest.fn();
const mockUseSearchParams = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
    }),
    useSearchParams: () => mockUseSearchParams(),
}));

// Mock AuthContext
const mockLogin = jest.fn();
jest.mock('@/context/AuthContext', () => ({
    useAuth: () => ({
        login: mockLogin,
    }),
}));

describe('OtpPage', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Setup default search params
        mockUseSearchParams.mockReturnValue({
            get: (key: string) => key === 'email' ? 'test@example.com' : null,
        });
        
        // Mock sessionStorage
        Object.defineProperty(window, 'sessionStorage', {
            value: {
                getItem: jest.fn((key) => key === 'pendingOtpEmail' ? 'test@example.com' : null),
                setItem: jest.fn(),
                removeItem: jest.fn(),
            },
            writable: true
        });
        
        global.fetch = jest.fn();
    });

    it('renders the OTP form when email is present', () => {
        render(<OtpPage />);
        expect(screen.getByText(/Verificar Código/i)).toBeInTheDocument();
        expect(screen.getByText(/test@example.com/i)).toBeInTheDocument();
    });

    it('redirects to /login when no email param and no session email', () => {
        mockUseSearchParams.mockReturnValue({ get: () => null });
        (window.sessionStorage.getItem as jest.Mock).mockReturnValue(null);
        
        render(<OtpPage />);
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('renders 6 individual OTP digit inputs', () => {
        render(<OtpPage />);
        const inputs = screen.getAllByRole('textbox');
        expect(inputs).toHaveLength(6);
    });

    it('calls API on form submit', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ accessToken: 'secret', customer: { id: 1, name: 'Test' } }),
        });

        render(<OtpPage />);
        const inputs = screen.getAllByRole('textbox');
        
        for (let i = 0; i < 6; i++) {
            fireEvent.change(inputs[i], { target: { value: '1' } });
        }

        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(global.fetch).toHaveBeenCalledWith(
                expect.stringContaining('/api/auth/customer/verify-otp'),
                expect.any(Object)
            );
            expect(mockLogin).toHaveBeenCalledWith('secret', { id: 1, name: 'Test' });
            expect(mockPush).toHaveBeenCalledWith('/');
        });
    });

    it('shows error on API failure', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid code' }),
        });

        render(<OtpPage />);
        const inputs = screen.getAllByRole('textbox');
        for (let i = 0; i < 6; i++) {
            fireEvent.change(inputs[i], { target: { value: '1' } });
        }
        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(screen.getByText('Invalid code')).toBeInTheDocument();
        });
    });

    it('shows generic error on network failure', async () => {
        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network error'));

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

    it('redirects to preLoginPath after successful login if present', async () => {
        (window.sessionStorage.getItem as jest.Mock).mockImplementation((key) => {
            if (key === 'pendingOtpEmail') return 'test@example.com';
            if (key === 'preLoginPath') return '/checkout';
            return null;
        });
        
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ accessToken: 'token', customer: { name: 'Test' } }),
        });

        render(<OtpPage />);

        const inputs = screen.getAllByRole('textbox');
        for (let i = 0; i < 6; i++) fireEvent.change(inputs[i], { target: { value: '1' } });

        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(mockPush).toHaveBeenCalledWith('/checkout');
        });
    });

    it('shows unknown error when non-Error object is thrown', async () => {
        (window.sessionStorage.getItem as jest.Mock).mockImplementation((key) => key === 'pendingOtpEmail' ? 'test@example.com' : null);
        global.fetch = jest.fn().mockImplementation(() => { throw 'string error'; });

        render(<OtpPage />);

        const inputs = screen.getAllByRole('textbox');
        for (let i = 0; i < 6; i++) fireEvent.change(inputs[i], { target: { value: '1' } });

        fireEvent.click(screen.getByRole('button', { name: /Completar Registro/i }));

        await waitFor(() => {
            expect(screen.getByText('Ocurrió un error al verificar el PIN')).toBeInTheDocument();
        });
    });

    it('moves focus back on backspace if current input is empty', () => {
        render(<OtpPage />);
        const inputs = screen.getAllByRole('textbox');
        
        inputs[1].focus();
        fireEvent.keyDown(inputs[1], { key: 'Backspace' });
        
        expect(inputs[0]).toHaveFocus();
    });

    it('handles paste of 6 digits', async () => {
        render(<OtpPage />);
        const inputs = screen.getAllByRole('textbox');
        
        const pasteData = {
            clipboardData: {
                getData: () => '123456',
            },
            preventDefault: jest.fn(),
        };

        fireEvent.paste(inputs[0], pasteData);
        
        expect(inputs[0]).toHaveValue('1');
        expect(inputs[5]).toHaveValue('6');
    });
});
