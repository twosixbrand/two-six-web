import { render, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../src/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

const mockPush = jest.fn();

// Helper component to test useAuth hook
const TestComponent = ({ action }: { action?: (auth: any) => void }) => {
    const authValues = useAuth();

    if (action) {
        action(authValues);
    }

    return (
        <div>
            <span data-testid="is-logged-in">{String(authValues.isLoggedIn)}</span>
            <span data-testid="user-name">{authValues.userName || 'null'}</span>
            <span data-testid="loading">{String(authValues.loading)}</span>
        </div>
    );
};

describe('AuthContext', () => {
    const validPayload = { exp: Math.floor(Date.now() / 1000) + 3600 };
    const mockToken = `header.${btoa(JSON.stringify(validPayload))}.signature`;

    beforeEach(() => {
        window.localStorage.clear();
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    });

    it('provides initial logged out state', () => {
        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByTestId('is-logged-in').textContent).toBe('false');
        expect(getByTestId('user-name').textContent).toBe('null');
        expect(getByTestId('loading').textContent).toBe('false');
    });

    it('loads user from localStorage if token and data exist', () => {
        window.localStorage.setItem('customerToken', mockToken);
        window.localStorage.setItem('customerData', JSON.stringify({ name: 'John Doe' }));

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByTestId('is-logged-in').textContent).toBe('true');
        expect(getByTestId('user-name').textContent).toBe('John Doe');
    });

    it('handles invalid JSON in localStorage gracefully', () => {
        window.localStorage.setItem('customerToken', mockToken);
        window.localStorage.setItem('customerData', 'invalid-json');

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByTestId('is-logged-in').textContent).toBe('true');
        expect(getByTestId('user-name').textContent).toBe('Usuario');
    });

    it('logs in a user successfully', () => {
        let currentAuth: any;

        render(
            <AuthProvider>
                <TestComponent action={(auth) => { currentAuth = auth; }} />
            </AuthProvider>
        );

        act(() => {
            currentAuth.login('new-token', { name: 'Jane Doe', email: 'jane@test.com' });
        });

        expect(currentAuth.isLoggedIn).toBe(true);
        expect(currentAuth.userName).toBe('Jane Doe');
        expect(window.localStorage.getItem('customerToken')).toBe('new-token');
        expect(JSON.parse(window.localStorage.getItem('customerData') || '{}').name).toBe('Jane Doe');
    });

    it('logs out a user successfully and redirects to login', () => {
        window.localStorage.setItem('customerToken', mockToken);
        window.localStorage.setItem('customerData', JSON.stringify({ name: 'Bob' }));

        let currentAuth: any;

        render(
            <AuthProvider>
                <TestComponent action={(auth) => { currentAuth = auth; }} />
            </AuthProvider>
        );

        expect(currentAuth.isLoggedIn).toBe(true); // Verifying initial logged in state

        act(() => {
            currentAuth.logout();
        });

        expect(currentAuth.isLoggedIn).toBe(false);
        expect(currentAuth.userName).toBeNull();
        expect(window.localStorage.getItem('customerToken')).toBeNull();
        expect(window.localStorage.getItem('customerData')).toBeNull();
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('throws error if useAuth is used outside AuthProvider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => render(<TestComponent />)).toThrow('useAuth debe ser usado dentro de un AuthProvider');

        consoleSpy.mockRestore();
    });
});
