import React from 'react';
import { render, screen } from '@testing-library/react';
import CartPage from '../../src/app/cart/page';
import { useCart } from '../../src/context/CartContext';

// Mock the cart context
jest.mock('../../src/context/CartContext', () => ({
    useCart: jest.fn(),
}));

// Mock the CartItem component
jest.mock('../../src/components/CartItem', () => ({
    __esModule: true,
    default: ({ item, formatPrice }: any) => (
        <div data-testid="mock-cart-item">
            {item.name} - {formatPrice(item.price)}
        </div>
    )
}));

// Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    );
});

describe('CartPage', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders empty cart state when no items are present', () => {
        (useCart as jest.Mock).mockReturnValue({
            cartItems: [],
            itemCount: 0,
            cartTotal: 0,
            removeFromCart: jest.fn(),
            updateQuantity: jest.fn(),
        });

        render(<CartPage />);

        expect(screen.getByText('Tu Bolsa está Vacía')).toBeInTheDocument();
        expect(screen.getByText('Parece que aún no has añadido prendas. Explora nuestras colecciones exclusivas.')).toBeInTheDocument();

        const updateBtn = screen.getByRole('link', { name: /Descubrir Novedades/i });
        expect(updateBtn).toHaveAttribute('href', '/unisex');
    });

    it('renders populated cart state with items and total', () => {
        const mockItems = [
            { id: '1', name: 'Gorra Test', price: 50000, quantity: 2, size: 'M' },
            { id: '2', name: 'Camiseta Test', price: 100000, quantity: 1, size: 'L' },
        ];

        (useCart as jest.Mock).mockReturnValue({
            cartItems: mockItems,
            itemCount: 3,
            cartTotal: 200000,
            removeFromCart: jest.fn(),
            updateQuantity: jest.fn(),
        });

        render(<CartPage />);

        // Verify Title and Layout
        expect(screen.getByText('Tu Bolsa')).toBeInTheDocument();
        expect(screen.getByText('Resumen del Pedido')).toBeInTheDocument();

        // Verify cart details mapped
        const cartItems = screen.getAllByTestId('mock-cart-item');
        expect(cartItems).toHaveLength(2);
        expect(cartItems[0]).toHaveTextContent('Gorra Test');
        expect(cartItems[1]).toHaveTextContent('Camiseta Test');

        // Check if totals are formatted properly (currency logic validation locally to formatPrice within component)
        // Since Intl.NumberFormat might behave slightly differently based on Node env, we use a flexible regex
        const totals = screen.getAllByText(/200[.,\s]*000/i);
        expect(totals.length).toBeGreaterThan(0);

        // Check checkout link navigation
        const checkoutBtn = screen.getByRole('link', { name: /Finalizar Compra/i });
        expect(checkoutBtn).toHaveAttribute('href', '/checkout');
    });
});
