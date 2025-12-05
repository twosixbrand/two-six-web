"use client";

import { useState } from "react";
import Image from "next/image";
import type { CartItem } from "@/context/CartContext";

interface CheckoutSummaryItemProps {
    item: CartItem;
    formatPrice: (price: number) => string;
}

export default function CheckoutSummaryItem({
    item,
    formatPrice,
}: CheckoutSummaryItemProps) {
    const [imgSrc, setImgSrc] = useState(item.image_url || "/placeholder.png");

    return (
        <div className="flex items-center space-x-4">
            <div className="relative w-16 h-16 rounded overflow-hidden flex-shrink-0">
                <Image
                    src={imgSrc}
                    alt={item.name}
                    fill
                    className="object-cover"
                    onError={() => setImgSrc("/placeholder.png")}
                />
            </div>
            <div className="flex-grow">
                <h3 className="text-sm font-medium text-primary">{item.name}</h3>
                <p className="text-xs text-primary/70">
                    {item.designClothing.color.name} / {item.designClothing.size.name} x{" "}
                    {item.quantity}
                </p>
            </div>
            <p className="text-sm font-semibold text-primary">
                {formatPrice(item.price * item.quantity)}
            </p>
        </div>
    );
}
