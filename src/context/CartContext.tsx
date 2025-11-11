"use client";

import { createContext, useContext, useState, useEffect, ReactNode } from 'react';
import type { Product } from '@/types';

export interface CartItem extends Product {
  quantity: number;
}

interface CartContextType {
  cartItems: CartItem[];
  addToCart: (item: Product) => void;
  removeFromCart: (itemId: number) => void;
  updateQuantity: (itemId: number, newQuantity: number) => void;
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
        // Si el item ya existe, incrementa la cantidad
        return prevItems.map(cartItem =>
          cartItem.id === item.id
            ? { ...cartItem, quantity: cartItem.quantity + 1 }
            : cartItem
        );
      } else {
        // Si es un item nuevo, lo añade al carrito con cantidad 1
        return [...prevItems, { ...item, quantity: 1 }];
      }
    });
    // Aquí podrías añadir una notificación de "Producto añadido"
    console.log('Producto añadido:', item.name);
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

  // Contar el número total de artículos en el carrito
  const itemCount = cartItems.reduce((total, item) => total + item.quantity, 0);

  // Calcular el precio total del carrito
  const cartTotal = cartItems.reduce(
    (total, item) => total + item.price * item.quantity,
    0
  );

  return (
    <CartContext.Provider value={{ cartItems, addToCart, removeFromCart, updateQuantity, itemCount, cartTotal }}>
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