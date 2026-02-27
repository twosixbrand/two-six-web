"use client";

import { useCart } from "@/context/CartContext";
import CartItem from "@/components/CartItem";
import Link from "next/link";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";

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
      <div className="container mx-auto px-4 py-32 text-center min-h-[60vh] flex flex-col items-center justify-center">
        <h1 className="text-4xl font-serif text-primary mb-6">Tu Bolsa está Vacía</h1>
        <p className="text-muted-foreground text-lg mb-10 max-w-md">Parece que aún no has añadido prendas. Explora nuestras colecciones exclusivas.</p>
        <Button asChild size="lg" className="bg-accent text-primary hover:bg-accent/90 px-10 py-6 text-lg tracking-wider uppercase">
          <Link href="/unisex">Descubrir Novedades</Link>
        </Button>
      </div>
    );
  }

  return (
    <div className="bg-secondary/20 min-h-screen py-16">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-6xl">
        <h1 className="text-3xl md:text-5xl font-serif font-bold text-primary mb-10 tracking-tight">Tu Bolsa</h1>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-start">
          {/* Columna de Items del Carrito */}
          <div className="lg:col-span-8 flex flex-col gap-6">
            <div className="hidden md:grid grid-cols-12 gap-4 text-xs font-semibold text-muted-foreground uppercase tracking-widest pb-4 border-b border-border">
              <div className="col-span-6">Producto</div>
              <div className="col-span-3 text-center">Cantidad</div>
              <div className="col-span-3 text-right">Total</div>
            </div>

            <div className="flex flex-col gap-6">
              {cartItems.map((item) => (
                <div key={item.id}>
                  <CartItem
                    item={item}
                    updateQuantity={updateQuantity}
                    removeFromCart={removeFromCart}
                    formatPrice={formatPrice}
                  />
                  <Separator className="mt-6" />
                </div>
              ))}
            </div>
          </div>

          {/* Columna de Resumen del Pedido */}
          <div className="lg:col-span-4">
            <div className="bg-white p-8 rounded-2xl shadow-sm border border-border sticky top-32">
              <h2 className="text-xl font-serif font-bold text-primary mb-6">Resumen del Pedido</h2>

              <div className="space-y-4 text-sm">
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Subtotal ({itemCount} prendas)</span>
                  <span className="font-medium text-primary">{formatPrice(cartTotal)}</span>
                </div>
                <div className="flex justify-between items-center text-muted-foreground">
                  <span>Envío Estándar</span>
                  <span className="text-xs uppercase tracking-wider">Por Calcular</span>
                </div>
              </div>

              <Separator className="my-6" />

              <div className="flex justify-between items-end mb-8">
                <span className="text-sm font-semibold uppercase tracking-wider text-primary">Total Estimado</span>
                <span className="text-2xl font-bold text-accent">{formatPrice(cartTotal)}</span>
              </div>

              <Button asChild size="lg" className="w-full bg-primary text-secondary hover:bg-primary/90 py-6 text-sm uppercase tracking-widest shadow-xl">
                <Link href="/checkout">Finalizar Compra</Link>
              </Button>

              <p className="text-xs text-center text-muted-foreground mt-4">
                Impuestos incluidos. Los gatos de envío se calculan en el checkout.
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}