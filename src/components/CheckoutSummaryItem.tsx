"use client";

import { useState, useEffect } from "react";
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
    const getInitialImage = () => {
        return item.image_url ||
            item.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url ||
            item.clothingSize?.clothingColor?.image_url ||
            "/placeholder.png";
    };

    const [imgSrc, setImgSrc] = useState(getInitialImage());

    useEffect(() => {
        setImgSrc(getInitialImage());
    }, [item.id, item.image_url, item.clothingSize?.clothingColor?.imageClothing?.[0]?.image_url, item.clothingSize?.clothingColor?.image_url]);

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
                    {item.clothingSize.clothingColor.color.name} / {item.clothingSize.size.name} x{" "}
                    {item.quantity}
                </p>
            </div>
            <p className="text-sm font-semibold text-primary">
                {formatPrice(item.price * item.quantity)}
            </p>
        </div>
    );
}
