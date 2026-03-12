"use client";

import { useState, useEffect } from "react";
import * as React from "react";
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
    const getInitialImage = React.useCallback(() => {
        return item.image_url ||
            item.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ||
            item.clothingSize?.clothingColor?.image_url ||
            "/placeholder.png";
    }, [item.image_url, item.clothingSize?.clothingColor?.imageClothing, item.clothingSize?.clothingColor?.image_url]);

    const [imgSrc, setImgSrc] = useState(getInitialImage());

    // Update image if the item prop changes (e.g. from context update)
    useEffect(() => {
        setImgSrc(getInitialImage());
    }, [getInitialImage]);

    return (
        <div className="flex flex-col sm:flex-row sm:items-center bg-white p-4 rounded-lg shadow-md gap-4">
            <div className="flex items-center w-full sm:w-auto flex-grow">
                {/* Imagen */}
                <div className="relative w-20 h-20 sm:w-24 sm:h-24 rounded-md overflow-hidden mr-4 sm:mr-6 flex-shrink-0">
                    <Image
                        src={imgSrc}
                        alt={item.name}
                        fill
                        className="object-contain bg-gray-50"
                        onError={() => setImgSrc("/placeholder.png")}
                    />
                </div>

                {/* Detalles del Producto */}
                <div className="flex-grow min-w-0 pr-2">
                    <h2 className="font-bold text-primary line-clamp-2 text-sm sm:text-base">{item.name}</h2>
                    <p className="text-xs sm:text-sm text-primary/70 mt-1">
                        Color: {item.clothingSize?.clothingColor?.color?.name ?? 'N/A'} / Talla:{" "}
                        {item.clothingSize?.size?.name ?? 'N/A'}
                    </p>
                    <p className="text-accent font-semibold mt-1 text-sm">
                        {formatPrice(item.price)}
                    </p>
                </div>
            </div>

            <div className="flex items-center justify-between w-full sm:w-auto pt-4 sm:pt-0 border-t sm:border-0 border-gray-100">
                {/* Controles de Cantidad */}
                <div className="flex items-center space-x-3 sm:mx-6">
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
                <div className="flex items-center space-x-4 sm:block sm:text-right">
                    <p className="font-bold text-primary sm:mb-2">
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
        </div>
    );
}
