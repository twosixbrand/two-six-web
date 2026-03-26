import { render, act } from '@testing-library/react';
import React from 'react';
import { AuthProvider, useAuth } from '../../src/context/AuthContext';
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

    it('login() stores token and customerData in localStorage', () => {
        let currentAuth: any;

        render(
            <AuthProvider>
                <TestComponent action={(auth) => { currentAuth = auth; }} />
            </AuthProvider>
        );

        act(() => {
            currentAuth.login('my-token-123', { name: 'Jane Doe', email: 'jane@test.com' });
        });

        // Verify localStorage was populated
        expect(window.localStorage.getItem('customerToken')).toBe('my-token-123');
        const storedData = JSON.parse(window.localStorage.getItem('customerData') || '{}');
        expect(storedData.name).toBe('Jane Doe');
        expect(storedData.email).toBe('jane@test.com');

        // Verify state updated
        expect(currentAuth.isLoggedIn).toBe(true);
        expect(currentAuth.userName).toBe('Jane Doe');
    });

    it('logout() clears localStorage and redirects', () => {
        window.localStorage.setItem('customerToken', 'existing-token');
        window.localStorage.setItem('customerData', JSON.stringify({ name: 'Bob' }));

        let currentAuth: any;

        render(
            <AuthProvider>
                <TestComponent action={(auth) => { currentAuth = auth; }} />
            </AuthProvider>
        );

        // Should be logged in initially from localStorage
        expect(currentAuth.isLoggedIn).toBe(true);

        act(() => {
            currentAuth.logout();
        });

        // localStorage should be cleared
        expect(window.localStorage.getItem('customerToken')).toBeNull();
        expect(window.localStorage.getItem('customerData')).toBeNull();

        // State should reflect logged out
        expect(currentAuth.isLoggedIn).toBe(false);
        expect(currentAuth.userName).toBeNull();

        // Should redirect to login
        expect(mockPush).toHaveBeenCalledWith('/login');
    });

    it('isLoggedIn reflects state correctly after login and logout', () => {
        let currentAuth: any;

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent action={(auth) => { currentAuth = auth; }} />
            </AuthProvider>
        );

        // Initially logged out
        expect(getByTestId('is-logged-in').textContent).toBe('false');

        // After login
        act(() => {
            currentAuth.login('tok', { name: 'A' });
        });
        expect(getByTestId('is-logged-in').textContent).toBe('true');

        // After logout
        act(() => {
            currentAuth.logout();
        });
        expect(getByTestId('is-logged-in').textContent).toBe('false');
    });

    it('userName is extracted from customerData', () => {
        window.localStorage.setItem('customerToken', 'tok');
        window.localStorage.setItem('customerData', JSON.stringify({ name: 'Carlos Gomez' }));

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByTestId('user-name').textContent).toBe('Carlos Gomez');
    });

    it('userName defaults to "Usuario" when name is missing', () => {
        window.localStorage.setItem('customerToken', 'tok');
        window.localStorage.setItem('customerData', JSON.stringify({ email: 'no-name@test.com' }));

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByTestId('user-name').textContent).toBe('Usuario');
    });

    it('handles invalid JSON in localStorage gracefully', () => {
        window.localStorage.setItem('customerToken', 'tok');
        window.localStorage.setItem('customerData', 'invalid-json');

        const { getByTestId } = render(
            <AuthProvider>
                <TestComponent />
            </AuthProvider>
        );

        expect(getByTestId('is-logged-in').textContent).toBe('true');
        expect(getByTestId('user-name').textContent).toBe('Usuario');
    });

    it('throws error if useAuth is used outside AuthProvider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<TestComponent />)).toThrow('useAuth debe ser usado dentro de un AuthProvider');
        consoleSpy.mockRestore();
    });
});
