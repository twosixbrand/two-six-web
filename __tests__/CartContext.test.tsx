import { render, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from '../src/context/CartContext';

// Helper component to test useCart hook
const TestComponent = ({ action }: { action?: (cart: any) => void }) => {
    const cartValues = useCart();

    if (action) {
        action(cartValues);
    }

    return (
        <div>
            <span data-testid="item-count">{cartValues.itemCount}</span>
            <span data-testid="cart-total">{cartValues.cartTotal}</span>
            <span data-testid="items-length">{cartValues.cartItems.length}</span>
        </div>
    );
};

const mockProduct = {
    id: 1,
    name: 'Test Product',
    price: 100,
    description: 'A test product',
    category: 'Test',
    stock: 10,
    image_url: '/test.jpg',
    brand: 'TestBrand',
    material: 'Cotton',
    created_at: '2023-01-01',
    updated_at: '2023-01-01',
    slug: 'test-product',
    is_active: true
};

describe('CartContext', () => {
    beforeEach(() => {
        // Clear localStorage before each test
        window.localStorage.clear();
        // Clear mocks
        jest.clearAllMocks();
    });

    it('provides initial empty state', () => {
        const { getByTestId } = render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        expect(getByTestId('item-count').textContent).toBe('0');
        expect(getByTestId('cart-total').textContent).toBe('0');
        expect(getByTestId('items-length').textContent).toBe('0');
    });

    it('loads cart from localStorage on mount', () => {
        const storedCart = [{ ...mockProduct, quantity: 2 }];
        window.localStorage.setItem('shopping-cart', JSON.stringify(storedCart));

        const { getByTestId } = render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        expect(getByTestId('item-count').textContent).toBe('2');
        expect(getByTestId('cart-total').textContent).toBe('200');
        expect(getByTestId('items-length').textContent).toBe('1');
    });

    it('adds a new item to the cart', () => {
        let currentCart: any;

        render(
            <CartProvider>
                <TestComponent action={(cart) => { currentCart = cart; }} />
            </CartProvider>
        );

        act(() => {
            currentCart.addToCart(mockProduct);
        });

        expect(currentCart.cartItems.length).toBe(1);
        expect(currentCart.itemCount).toBe(1);
        expect(currentCart.cartTotal).toBe(100);
        expect(currentCart.cartItems[0].quantity).toBe(1);

        // Check if it was saved to localStorage
        const storedCart = JSON.parse(window.localStorage.getItem('shopping-cart') || '[]');
        expect(storedCart.length).toBe(1);
    });

    it('increments quantity when adding an existing item', () => {
        let currentCart: any;

        render(
            <CartProvider>
                <TestComponent action={(cart) => { currentCart = cart; }} />
            </CartProvider>
        );

        // Add exactly same item twice
        act(() => {
            currentCart.addToCart(mockProduct);
        });

        act(() => {
            currentCart.addToCart(mockProduct);
        });

        expect(currentCart.cartItems.length).toBe(1); // Still 1 item type
        expect(currentCart.itemCount).toBe(2);        // But 2 total items
        expect(currentCart.cartTotal).toBe(200);      // 100 * 2
        expect(currentCart.cartItems[0].quantity).toBe(2);
    });

    it('updates item quantity', () => {
        let currentCart: any;

        render(
            <CartProvider>
                <TestComponent action={(cart) => { currentCart = cart; }} />
            </CartProvider>
        );

        act(() => {
            currentCart.addToCart(mockProduct);
        });

        act(() => {
            currentCart.updateQuantity(mockProduct.id, 5);
        });

        expect(currentCart.itemCount).toBe(5);
        expect(currentCart.cartTotal).toBe(500);
        expect(currentCart.cartItems[0].quantity).toBe(5);
    });

    it('removes item if quantity is set to 0 or less', () => {
        let currentCart: any;

        render(
            <CartProvider>
                <TestComponent action={(cart) => { currentCart = cart; }} />
            </CartProvider>
        );

        act(() => {
            currentCart.addToCart(mockProduct);
            currentCart.updateQuantity(mockProduct.id, 0);
        });

        expect(currentCart.cartItems.length).toBe(0);
        expect(currentCart.itemCount).toBe(0);
    });

    it('removes item completely using removeFromCart', () => {
        let currentCart: any;

        render(
            <CartProvider>
                <TestComponent action={(cart) => { currentCart = cart; }} />
            </CartProvider>
        );

        act(() => {
            currentCart.addToCart(mockProduct);
            currentCart.removeFromCart(mockProduct.id);
        });

        expect(currentCart.cartItems.length).toBe(0);
        expect(currentCart.itemCount).toBe(0);
    });

    it('clears the cart', () => {
        let currentCart: any;

        render(
            <CartProvider>
                <TestComponent action={(cart) => { currentCart = cart; }} />
            </CartProvider>
        );

        act(() => {
            currentCart.addToCart(mockProduct);
            currentCart.addToCart({ ...mockProduct, id: 2, price: 50 });
        });

        expect(currentCart.cartItems.length).toBe(2);

        act(() => {
            currentCart.clearCart();
        });

        expect(currentCart.cartItems.length).toBe(0);
        expect(currentCart.itemCount).toBe(0);
        expect(currentCart.cartTotal).toBe(0);
    });

    it('throws error if useCart is used outside CartProvider', () => {
        // Suppress console.error for this specific test
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => { });

        expect(() => render(<TestComponent />)).toThrow('useCart debe ser usado dentro de un CartProvider');

        consoleSpy.mockRestore();
    });
});
