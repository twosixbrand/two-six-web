import { renderHook, act } from '@testing-library/react';
import { CartProvider, useCart } from './CartContext';
import { ReactNode } from 'react';

const wrapper = ({ children }: { children: ReactNode }) => (
  <CartProvider>{children}</CartProvider>
);

const mockProduct = {
  id: 1,
  name: 'Test Product',
  price: 50000,
  image_url: 'http://image.com',
  slug: 'test'
};

describe('CartContext', () => {
  beforeEach(() => {
    window.localStorage.clear();
  });

  it('provides empty initial state', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    expect(result.current.cartItems).toEqual([]);
    expect(result.current.itemCount).toBe(0);
    expect(result.current.cartTotal).toBe(0);
  });

  it('adds items to cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct as any);
    });

    expect(result.current.cartItems.length).toBe(1);
    expect(result.current.cartItems[0].name).toBe('Test Product');
    expect(result.current.itemCount).toBe(1);
    expect(result.current.cartTotal).toBe(50000);
  });

  it('increments quantity when adding same item', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct as any);
      result.current.addToCart(mockProduct as any);
    });

    expect(result.current.cartItems.length).toBe(1);
    expect(result.current.cartItems[0].quantity).toBe(2);
    expect(result.current.itemCount).toBe(2);
    expect(result.current.cartTotal).toBe(100000);
  });

  it('updates quantity correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct as any);
    });

    act(() => {
      result.current.updateQuantity(1, 5);
    });

    expect(result.current.cartItems[0].quantity).toBe(5);
    expect(result.current.itemCount).toBe(5);

    act(() => {
      result.current.updateQuantity(1, 0); // Should remove
    });

    expect(result.current.cartItems.length).toBe(0);
  });

  it('removes items correctly', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct as any);
      result.current.removeFromCart(1);
    });

    expect(result.current.cartItems.length).toBe(0);
  });

  it('clears cart', () => {
    const { result } = renderHook(() => useCart(), { wrapper });
    
    act(() => {
      result.current.addToCart(mockProduct as any);
      result.current.clearCart();
    });

    expect(result.current.cartItems.length).toBe(0);
  });
});
