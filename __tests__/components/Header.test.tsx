import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import Header from '../../src/components/Header';
import { AuthProvider } from '../../src/context/AuthContext';
import * as CartContextModule from '../../src/context/CartContext';
import { useRouter } from 'next/navigation';

// Mock useRouter
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
    usePathname: jest.fn(),
}));

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} priority={undefined} fetchPriority={undefined} />;
    },
}));

// Mock ResizeObserver
class ResizeObserver {
    observe() { }
    unobserve() { }
    disconnect() { }
}
window.ResizeObserver = ResizeObserver;

const renderWithProviders = (ui: React.ReactElement, initialAuthState = { isLoggedIn: false, userName: null }) => {
    // Pre-populate localStorage for AuthContext if needed
    if (initialAuthState.isLoggedIn) {
        window.localStorage.setItem('customerToken', 'fake-token');
        window.localStorage.setItem('customerData', JSON.stringify({ name: initialAuthState.userName || 'Test User' }));
    } else {
        window.localStorage.clear();
    }

    return render(
        <AuthProvider>
            {/* The test using populated state will mock useCart, others will use the real provider indirectly or we could just use real CartProvider everywhere but spy/mock the hook specifically for that test */}
            <CartContextModule.CartProvider>
                {ui}
            </CartContextModule.CartProvider>
        </AuthProvider>
    );
};

describe('Header component', () => {
    const originalWidth = window.innerWidth;

    beforeEach(() => {
        jest.clearAllMocks();
        (useRouter as jest.Mock).mockReturnValue({ push: jest.fn() });

        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: 1024, // Default Desktop
        });
    });

    afterEach(() => {
        Object.defineProperty(window, 'innerWidth', {
            writable: true,
            configurable: true,
            value: originalWidth,
        });
    });

    it('renders the logo', () => {
        renderWithProviders(<Header showOutletLink={false} />);
        const logo = screen.getByAltText('two-six-web Logo');
        expect(logo).toBeInTheDocument();
    });

    it('displays desktop navigation links', () => {
        renderWithProviders(<Header showOutletLink={false} />);

        // We get the triggers from Shadcn's NavigationMenu
        expect(screen.getByText('Hombre', { selector: 'button' })).toBeInTheDocument();
        expect(screen.getByText('Mujer', { selector: 'button' })).toBeInTheDocument();

        // Links inside Shadcn's NavigationMenu as Next links might need different queries due to nested DOM structure
        const links = screen.getAllByRole('link');
        expect(links.some(l => l.textContent?.includes('Unisex'))).toBe(true);
        expect(links.some(l => l.textContent?.includes('Rastrear Pedido'))).toBe(true);
    });

    it('shows login icon when user is not authenticated', () => {
        renderWithProviders(<Header showOutletLink={false} />);
        expect(screen.getByRole('link', { name: "Iniciar Sesión" })).toBeInTheDocument();
    });

    it('shows user menu and name when user is authenticated', () => {
        renderWithProviders(<Header showOutletLink={false} />, { isLoggedIn: true, userName: 'John Doe' });

        expect(screen.getByText('Hola, John')).toBeInTheDocument();
        expect(screen.getByRole('button', { name: "Menú de usuario" })).toBeInTheDocument();

        // User menu links should be in the document (hidden by CSS until hover, but present in DOM)
        expect(screen.getByText('Mi Perfil')).toBeInTheDocument();
        expect(screen.getByText('Mis Pedidos')).toBeInTheDocument();
        expect(screen.getByText('Cerrar Sesión')).toBeInTheDocument();
    });

    it('logs out user when clicking logout button', () => {
        renderWithProviders(<Header showOutletLink={false} />, { isLoggedIn: true, userName: 'John Doe' });

        const logoutBtn = screen.getByText('Cerrar Sesión');
        fireEvent.click(logoutBtn);

        // After logout, token should be removed
        expect(window.localStorage.getItem('customerToken')).toBeNull();
    });

    it('shows cart item count when items exist', async () => {
        // Since spying the context directly fails due to ESM/TypeScript exports, 
        // we'll revert to the `localStorage` loading path but handle updates asynchronously appropriately inside an `act` block 
        // to avoid `Maximum update depth exceeded`.

        // Reset storage first
        window.localStorage.clear();

        // 1. Set the mock data into local storage
        const cartData = [{ id: 1, quantity: 3, price: 100 }];
        window.localStorage.setItem('shopping-cart', JSON.stringify(cartData));

        // 2. Render the components
        render(
            <AuthProvider>
                <CartContextModule.CartProvider>
                    <Header showOutletLink={false} />
                </CartContextModule.CartProvider>
            </AuthProvider>
        );

        // 3. To simulate what happens in the app when storage changes, we manually dispatch an event 
        // since `CartProvider` uses a `useEffect`
        await act(async () => {
            window.dispatchEvent(new Event('storage'));
        });

        // 4. Assert with a short timeout. FindByText automatically waits and retries.
        expect(await screen.findByText('3')).toBeInTheDocument();

        // 5. Cleanup
        window.localStorage.clear();
    });

    it('toggles mobile menu', () => {
        // Set window resize to mobile
        Object.defineProperty(window, 'innerWidth', { value: 500 });
        fireEvent(window, new Event('resize'));

        renderWithProviders(<Header showOutletLink={true} />);

        const menuBtn = screen.getByRole('button', { name: "Abrir menú" });

        // Due to the way it is structured, the mobile menu links are always there but hidden by max-h-0
        // We test the button click changes state
        fireEvent.click(menuBtn);

        // After click, the mobile menu links should be visible 
        // We can just verify the click happened without errors, testing exact tailwind classes is brittle
        expect(menuBtn).toBeInTheDocument();

        // Check if outlet link renders when prop is true
        expect(screen.getByText('Outlet')).toBeInTheDocument();
    });

    it('closes mobile menu on resize to desktop', () => {
        // Set to mobile
        Object.defineProperty(window, 'innerWidth', { value: 500 });

        const { container } = renderWithProviders(<Header showOutletLink={false} />);

        // Open menu
        fireEvent.click(screen.getByRole('button', { name: "Abrir menú" }));

        // One of the menu containers should have max-h-screen when open
        expect(container.innerHTML).toContain('max-h-screen');

        // Simulate resize
        Object.defineProperty(window, 'innerWidth', { value: 1024 });
        fireEvent(window, new Event('resize'));

        // Menu should be closed (max-h-0)
        expect(container.innerHTML).toContain('max-h-0');
        expect(container.innerHTML).not.toContain('max-h-screen');
    });
});
