"use client";

import { useState } from "react";
import Image from "next/image";
import { TrashIcon, PlusIcon, MinusIcon } from "@heroicons/react/24/solid";
import type { CartItem as CartItemType } from "@/context/CartContext";

interface CartItemProps {
    item: CartItemType;
    updateQuantity: (itemId: number, newQuantity: number) => void;
    removeFromCart: (itemId: number) => void;
    formatPrice: (price: number) => string;
}

export default function CartItem({
    item,
    updateQuantity,
    removeFromCart,
    formatPrice,
}: CartItemProps) {
    const [imgSrc, setImgSrc] = useState(item.clothingSize.clothingColor.image_url || "/placeholder.png");

    return (
        <div className="flex items-center bg-white p-4 rounded-lg shadow-md">
            {/* Imagen */}
            <div className="relative w-24 h-24 rounded-md overflow-hidden mr-6 flex-shrink-0">
                <Image
                    src={imgSrc}
                    alt={item.name}
                    fill
                    className="object-cover"
                    onError={() => setImgSrc("/placeholder.png")}
                />
            </div>

            {/* Detalles del Producto */}
            <div className="flex-grow">
                <h2 className="font-bold text-primary">{item.name}</h2>
                <p className="text-sm text-primary/70">
                    Color: {item.clothingSize.clothingColor.color.name} / Talla:{" "}
                    {item.clothingSize.size.name}
                </p>
                <p className="text-accent font-semibold mt-1">
                    {formatPrice(item.price)}
                </p>
            </div>

            {/* Controles de Cantidad */}
            <div className="flex items-center space-x-3 mx-6">
                <button
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                    aria-label="Reducir cantidad"
                >
                    <MinusIcon className="w-4 h-4 text-primary" />
                </button>
                <span className="w-8 text-center font-medium">{item.quantity}</span>
                <button
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="p-1 rounded-full bg-gray-200 hover:bg-gray-300 transition"
                    aria-label="Aumentar cantidad"
                >
                    <PlusIcon className="w-4 h-4 text-primary" />
                </button>
            </div>

            {/* Subtotal y Botón de Eliminar */}
            <div className="text-right">
                <p className="font-bold text-primary mb-2">
                    {formatPrice(item.price * item.quantity)}
                </p>
                <button
                    onClick={() => removeFromCart(item.id)}
                    className="text-red-500 hover:text-red-700 transition"
                    aria-label={`Eliminar ${item.name}`}
                >
                    <TrashIcon className="w-5 h-5" />
                </button>
            </div>
        </div>
    );
}
