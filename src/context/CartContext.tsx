"use client";

import { createContext, useContext, useState, useEffect, useCallback, ReactNode } from 'react';
import type { Product } from '@/types';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Product) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, newQuantity: number) => void;
  clearCart: () => void;
  itemCount: number;
  cartTotal: number;
}

const CartContext = createContext<CartContextType | undefined>(undefined);

export const CartProvider = ({ children }: { children: ReactNode }) => {
  const [cartItems, setCartItems] = useState<CartItem[]>([]);

  // Al iniciar, cargar el carrito desde localStorage si existe
  useEffect(() => {
    const storedCart = localStorage.getItem('shopping-cart');
    if (storedCart) {
      setCartItems(JSON.parse(storedCart));
    }
  }, []);

  // Cada vez que el carrito cambie, guardarlo en localStorage
  useEffect(() => {
    localStorage.setItem('shopping-cart', JSON.stringify(cartItems));
  }, [cartItems]);

  const addToCart = (item: Product) => {
    setCartItems(prevItems => {
      const existingItem = prevItems.find(cartItem => cartItem.id === item.id);

      if (existingItem) {
        // If the item already exists, update its details (like image) and increment quantity
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, ...item, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // If it's a new item, add it with quantity 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
    // Aquí podrías añadir una notificación de "Producto añadido"
    if (process.env.NODE_ENV === 'development') {
      console.log('Producto añadido:', item.name);
    }
  };

  const removeFromCart = (itemId: number) => {
    setCartItems(prevItems => prevItems.filter(item => item.id !== itemId));
  };

  const updateQuantity = (itemId: number, newQuantity: number) => {
    setCartItems(prevItems => {
      if (newQuantity <= 0) {
        return prevItems.filter(item => item.id !== itemId);
      }
      return prevItems.map(item =>
        item.id === itemId ? { ...item, quantity: newQuantity } : item
      );
    });
  };

  const clearCart = useCallback(() => {
    setCartItems([]);
  }, []);

  // Contar el número total de artículos en el carrito
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calcular el precio total del carrito
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, clearCart, itemCount, cartTotal }}>
      {children}
    </CartContext.Provider>
  );
};

export const useCart = () => {
  const context = useContext(CartContext);
  if (context === undefined) {
    throw new Error('useCart debe ser usado dentro de un CartProvider');
  }
  return context;
};