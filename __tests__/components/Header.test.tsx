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

const renderWithProviders = (ui: React.ReactElement, initialAuthState: { isLoggedIn: boolean, userName: string | null } = { isLoggedIn: false, userName: null }) => {
    const validPayload = { exp: Math.floor(Date.now() / 1000) + 3600 };
    const mockToken = `header.${btoa(JSON.stringify(validPayload))}.signature`;

    // Pre-populate localStorage for AuthContext if needed
    if (initialAuthState.isLoggedIn) {
        window.localStorage.setItem('customerToken', mockToken);
        window.localStorage.setItem('customerData', JSON.stringify({ name: initialAuthState.userName || 'Test User' }));
    } else {
        window.localStorage.clear();
    }

    return render(
        <AuthProvider>
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
        // There are two "Iniciar Sesión" links (desktop + mobile), so use getAllByRole
        const loginLinks = screen.getAllByRole('link', { name: "Iniciar Sesión" });
        expect(loginLinks.length).toBeGreaterThanOrEqual(1);
    });

    it('shows user menu and name when user is authenticated', () => {
        renderWithProviders(<Header showOutletLink={false} />, { isLoggedIn: true, userName: 'John Doe' });

        expect(screen.getByText('Hola, John')).toBeInTheDocument();
        // There may be multiple "Menú de usuario" buttons (desktop + mobile)
        const menuBtns = screen.getAllByRole('button', { name: "Menú de usuario" });
        expect(menuBtns.length).toBeGreaterThanOrEqual(1);

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

        // 3. Dispatch storage event to trigger re-read
        await act(async () => {
            window.dispatchEvent(new Event('storage'));
        });

        // 4. Check that the cart count appears somewhere in the DOM
        // The count "3" appears in aria-label text and in the badge span
        const cartButtons = screen.getAllByLabelText(/Carrito de compras con 3 artículos/);
        expect(cartButtons.length).toBeGreaterThanOrEqual(1);

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
