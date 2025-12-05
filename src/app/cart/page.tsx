"use client";

import { useCart } from "@/context/CartContext";
import CartItem from "@/components/CartItem";
import Link from "next/link";

export default function CartPage() {
  const { cartItems, itemCount, cartTotal, removeFromCart, updateQuantity } = useCart();

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
      maximumFractionDigits: 0,
    }).format(price);
  };

  if (itemCount === 0) {
    return (
      <div className="container mx-auto px-4 py-20 text-center">
        <h1 className="text-3xl font-bold text-primary mb-4">Tu Carrito está Vacío</h1>
        <p className="text-primary/80 mb-8">Parece que aún no has añadido nada. ¡Explora nuestros productos!</p>
        <Link href="/" className="bg-accent text-white font-bold py-3 px-8 rounded-lg hover:bg-accent-hover transition-colors">
          Volver a la Tienda
        </Link>
      </div>
    );
  }

  return (
    <div className="bg-secondary">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <h1 className="text-3xl font-bold text-primary mb-8">Tu Carrito de Compras</h1>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Columna de Items del Carrito */}
          <div className="lg:col-span-2 space-y-6">
            {cartItems.map((item) => (
              <CartItem
                key={item.id}
                item={item}
                updateQuantity={updateQuantity}
                removeFromCart={removeFromCart}
                formatPrice={formatPrice}
              />
            ))}
          </div>

          {/* Columna de Resumen del Pedido */}
          <div className="lg:col-span-1">
            <div className="bg-white p-6 rounded-lg shadow-md sticky top-24">
              <h2 className="text-xl font-bold text-primary border-b pb-4 mb-4">Resumen del Pedido</h2>

              <div className="space-y-3">
                <div className="flex justify-between">
                  <span className="text-primary/80">Subtotal</span>
                  <span className="font-medium">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-primary/80">Envío</span>
                  <span className="font-medium">Calculado en el checkout</span>
                </div>
              </div>

              <div className="border-t mt-4 pt-4">
                <div className="flex justify-between font-bold text-lg">
                  <span>Total</span>
                  <span>{formatPrice(cartTotal)}</span>
                </div>
              </div>

              <Link href="/checkout" className="block mt-6 w-full bg-accent text-white font-bold py-3 rounded-lg hover:bg-accent-hover transition-colors duration-300 shadow-md text-center">
                Finalizar Compra
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}