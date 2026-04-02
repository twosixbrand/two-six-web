import { render, act } from '@testing-library/react';
import React from 'react';
import { CartProvider, useCart } from '../../src/context/CartContext';

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
    gender: 'MASCULINO' as const,
    description: 'A test product',
    image_url: '/test.jpg',
    clothingSize: {} as any,
};

const mockProduct2 = {
    id: 2,
    name: 'Another Product',
    price: 50,
    gender: 'FEMENINO' as const,
    description: 'Another test product',
    image_url: '/test2.jpg',
    clothingSize: {} as any,
};

describe('CartContext', () => {
    beforeEach(() => {
        window.localStorage.clear();
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

    it('addToCart adds an item to the cart', () => {
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
        expect(currentCart.cartItems[0].name).toBe('Test Product');
        expect(currentCart.cartItems[0].quantity).toBe(1);
    });

    it('addToCart increments quantity for existing item', () => {
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
            currentCart.addToCart(mockProduct);
        });

        expect(currentCart.cartItems.length).toBe(1);
        expect(currentCart.itemCount).toBe(2);
        expect(currentCart.cartTotal).toBe(200);
        expect(currentCart.cartItems[0].quantity).toBe(2);
    });

    it('removeFromCart removes an item', () => {
        let currentCart: any;

        render(
            <CartProvider>
                <TestComponent action={(cart) => { currentCart = cart; }} />
            </CartProvider>
        );

        act(() => {
            currentCart.addToCart(mockProduct);
            currentCart.addToCart(mockProduct2);
        });

        expect(currentCart.cartItems.length).toBe(2);

        act(() => {
            currentCart.removeFromCart(mockProduct.id);
        });

        expect(currentCart.cartItems.length).toBe(1);
        expect(currentCart.cartItems[0].id).toBe(2);
    });

    it('updateQuantity changes the quantity of an item', () => {
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

        expect(currentCart.cartItems[0].quantity).toBe(5);
        expect(currentCart.itemCount).toBe(5);
        expect(currentCart.cartTotal).toBe(500);
    });

    it('updateQuantity removes item when quantity is 0 or less', () => {
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
            currentCart.updateQuantity(mockProduct.id, 0);
        });

        expect(currentCart.cartItems.length).toBe(0);
        expect(currentCart.itemCount).toBe(0);
    });

    it('clearCart empties the cart', () => {
        let currentCart: any;

        render(
            <CartProvider>
                <TestComponent action={(cart) => { currentCart = cart; }} />
            </CartProvider>
        );

        act(() => {
            currentCart.addToCart(mockProduct);
            currentCart.addToCart(mockProduct2);
        });

        expect(currentCart.cartItems.length).toBe(2);

        act(() => {
            currentCart.clearCart();
        });

        expect(currentCart.cartItems.length).toBe(0);
        expect(currentCart.itemCount).toBe(0);
        expect(currentCart.cartTotal).toBe(0);
    });

    it('cartTotal calculates correctly with multiple items', () => {
        let currentCart: any;

        render(
            <CartProvider>
                <TestComponent action={(cart) => { currentCart = cart; }} />
            </CartProvider>
        );

        act(() => {
            currentCart.addToCart(mockProduct);   // 100 x 1
            currentCart.addToCart(mockProduct2);   // 50 x 1
        });

        // 100 + 50 = 150
        expect(currentCart.cartTotal).toBe(150);

        act(() => {
            currentCart.updateQuantity(mockProduct.id, 3); // 100 x 3
        });

        // 300 + 50 = 350
        expect(currentCart.cartTotal).toBe(350);
    });

    it('persists cart to localStorage', () => {
        let currentCart: any;

        render(
            <CartProvider>
                <TestComponent action={(cart) => { currentCart = cart; }} />
            </CartProvider>
        );

        act(() => {
            currentCart.addToCart(mockProduct);
        });

        const stored = JSON.parse(window.localStorage.getItem('shopping-cart') || '[]');
        expect(stored.length).toBe(1);
        expect(stored[0].id).toBe(1);
        expect(stored[0].quantity).toBe(1);
    });

    it('loads cart from localStorage on mount', () => {
        const storedCart = [{ ...mockProduct, quantity: 3 }];
        window.localStorage.setItem('shopping-cart', JSON.stringify(storedCart));

        const { getByTestId } = render(
            <CartProvider>
                <TestComponent />
            </CartProvider>
        );

        expect(getByTestId('item-count').textContent).toBe('3');
        expect(getByTestId('cart-total').textContent).toBe('300');
        expect(getByTestId('items-length').textContent).toBe('1');
    });

    it('throws error if useCart is used outside CartProvider', () => {
        const consoleSpy = jest.spyOn(console, 'error').mockImplementation(() => {});
        expect(() => render(<TestComponent />)).toThrow('useCart debe ser usado dentro de un CartProvider');
        consoleSpy.mockRestore();
    });
});
