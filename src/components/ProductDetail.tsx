"use client"; // Este componente es interactivo y se ejecuta en el cliente

import { useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import type { Product, Color, Size } from "@/types"; // Asumiendo que tienes un archivo de tipos

interface ProductDetailProps {
  initialProduct: Product;
  variants: Product[];
}

export default function ProductDetail({
  initialProduct,
  variants,
}: ProductDetailProps) {
  const [selectedVariant, setSelectedVariant] = useState<Product | null>(null);
  const [selectedColor, setSelectedColor] = useState<Color | null>(null);
  const [selectedSize, setSelectedSize] = useState<Size | null>(null);
  const [imageUrl, setImageUrl] = useState<string | null>(null);
  const { addToCart } = useCart();
  const [availableColors, setAvailableColors] = useState<Color[]>([]);
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);

  // Estado para el acordeón
  const [openAccordion, setOpenAccordion] = useState<string | null>(
    "description"
  );

  const AccordionItem = ({
    title,
    id,
    children,
  }: {
    title: string;
    id: string;
    children: React.ReactNode;
  }) => (
    <div className="border-b">
      <button
        onClick={() => setOpenAccordion(openAccordion === id ? null : id)}
        className="flex justify-between items-center w-full py-4 text-left"
      >
        <h3 className="font-semibold text-primary">{title}</h3>
        <ChevronDownIcon
          className={`w-5 h-5 transition-transform ${openAccordion === id ? "rotate-180" : ""
            }`}
        />
      </button>
      <div
        className={`overflow-hidden transition-all duration-300 ease-in-out ${openAccordion === id ? "max-h-screen py-4" : "max-h-0"
          }`}
      >
        {children}
      </div>
    </div>
  );
  // La obtención de datos ahora se hace en el Server Component,
  // por lo que este useEffect ya no es necesario.

  const [currentImages, setCurrentImages] = useState<string[]>([]);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);

  // Helper to extract images from a product variant
  const getImages = (p: Product) => {
    const variantImages = p.clothingSize.clothingColor.imageClothing
      ?.sort((a, b) => (a.position || 0) - (b.position || 0))
      ?.map(img => img.image_url) || [];

    // If we have specific images, use them
    if (variantImages.length > 0) {
      return variantImages;
    }

    // Fallback to the main prioritized image_url (which is design image or single variant image)
    return p.image_url ? [p.image_url] : ["/placeholder.png"];
  };

  useEffect(() => {
    setSelectedVariant(initialProduct);
    setSelectedColor(initialProduct.clothingSize.clothingColor.color);
    setSelectedSize(initialProduct.clothingSize.size);

    const images = getImages(initialProduct);
    setCurrentImages(images);
    setSelectedImageIndex(0);
    setImageUrl(images[0]); // Mantener compatibilidad si se usa en otro lado

    const uniqueColors = Array.from(
      new Map(
        variants.map((v) => [v.clothingSize.clothingColor.color.id, v.clothingSize.clothingColor.color])
      ).values()
    );
    const uniqueSizes = Array.from(
      new Map(
        variants.map((v) => [v.clothingSize.size.id, v.clothingSize.size])
      ).values()
    );
    setAvailableColors(uniqueColors);
    setAvailableSizes(uniqueSizes);
  }, [initialProduct, variants]);

  if (!initialProduct || !selectedVariant) {
    // Puedes mostrar un skeleton/loader aquí mientras carga
    return (
      <div className="container mx-auto px-6 py-12 text-center">
        Cargando producto...
      </div>
    );
  }

  const handleColorSelect = (color: Color) => {
    setSelectedColor(color);
    // Busca la primera variante disponible para el nuevo color y la talla actual.
    // Si no existe, busca la primera variante disponible para ese color con cualquier talla.
    let newVariant = variants.find(
      (v) =>
        v.clothingSize.clothingColor.color.id === color.id &&
        v.clothingSize.size.id === selectedSize?.id
    );

    if (!newVariant) {
      newVariant = variants.find((v) => v.clothingSize.clothingColor.color.id === color.id);
    }

    if (newVariant) {
      setSelectedSize(newVariant.clothingSize.size);
      setSelectedVariant(newVariant);

      const images = getImages(newVariant);
      setCurrentImages(images);
      setSelectedImageIndex(0);
      setImageUrl(images[0]);
    }
  };

  const handleSizeSelect = (size: Size) => {
    setSelectedSize(size);
    const newVariant = variants.find(
      (v) =>
        v.clothingSize.clothingColor.color.id === selectedColor?.id &&
        v.clothingSize.size.id === size.id
    );
    setSelectedVariant(newVariant || null);
  };

  const handleAddToCart = () => {
    if (selectedVariant) {
      // Get the correct image for the cart (position 1)
      const images = getImages(selectedVariant);
      // Create a copy of the product with the correct image
      const productForCart = {
        ...selectedVariant,
        image_url: images.length > 0 ? images[0] : (selectedVariant.image_url || "/placeholder.png")
      };

      addToCart(productForCart);
    }
  };

  const formattedPrice = new Intl.NumberFormat("es-CO", {
    style: "currency",
    currency: "COP",
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(initialProduct.price);

  return (
    <section className="bg-secondary py-12 md:py-20">
      <div className="container mx-auto px-8 max-w-7xl">
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-12">
          {/* Columna de la Imagen (ocupa 2 de 5 columnas en LG) */}
          <div className="lg:col-span-2">
            <div className="relative aspect-square rounded-xl overflow-hidden shadow-lg mb-4">
              <Image
                src={currentImages[selectedImageIndex] || "/placeholder.png"}
                alt={initialProduct.name}
                fill
                className="object-cover transition-opacity duration-300"
                key={currentImages[selectedImageIndex]}
                onError={() => {
                  // If the current image fails, maybe fallback to placeholder
                  // But usually validation happens before.
                }}
              />
              {/* Navigation Arrows if multiple images */}
              {currentImages.length > 1 && (
                <>
                  <button
                    onClick={() => setSelectedImageIndex(prev => (prev === 0 ? currentImages.length - 1 : prev - 1))}
                    className="absolute left-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
                  >
                    <ChevronDownIcon className="w-5 h-5 rotate-90" />
                  </button>
                  <button
                    onClick={() => setSelectedImageIndex(prev => (prev === currentImages.length - 1 ? 0 : prev + 1))}
                    className="absolute right-2 top-1/2 -translate-y-1/2 bg-white/80 p-2 rounded-full shadow hover:bg-white transition-colors"
                  >
                    <ChevronDownIcon className="w-5 h-5 -rotate-90" />
                  </button>
                </>
              )}
            </div>

            {/* Thumbnails */}
            {currentImages.length > 1 && (
              <div className="flex gap-2 overflow-x-auto pb-2">
                {currentImages.map((img, idx) => (
                  <button
                    key={idx}
                    onClick={() => setSelectedImageIndex(idx)}
                    className={`relative w-20 h-20 flex-shrink-0 rounded-lg overflow-hidden border-2 transition-all ${selectedImageIndex === idx ? "border-accent" : "border-transparent opacity-70 hover:opacity-100"
                      }`}
                  >
                    <Image
                      src={img}
                      alt={`Vista ${idx + 1}`}
                      fill
                      className="object-cover"
                    />
                  </button>
                ))}
              </div>
            )}
          </div>

          {/* Columna de Información (ocupa 3 de 5 columnas en LG) */}
          <div className="lg:col-span-3 flex flex-col justify-center">
            <h1 className="text-3xl md:text-4xl font-bold text-primary">
              {initialProduct.name}
            </h1>
            <p className="mt-2 text-2xl font-semibold text-accent">
              {formattedPrice}
            </p>

            {/* Acordeón de Detalles */}
            <div className="mt-8 space-y-4">
              <AccordionItem title="Descripción" id="description">
                <p className="text-primary/80 leading-relaxed">
                  {initialProduct.description}
                </p>
              </AccordionItem>
              <AccordionItem title="Detalles del Producto" id="details">
                <ul className="list-disc list-inside text-primary/80 space-y-1">
                  <li>
                    Referencia: {initialProduct.clothingSize.clothingColor.design.reference}
                  </li>
                </ul>
              </AccordionItem>
              <AccordionItem title="Cuidados" id="care">
                <p className="text-primary/80 leading-relaxed">
                  Lavar a máquina con agua fría. No usar blanqueador. Secar a
                  baja temperatura.
                </p>
              </AccordionItem>
            </div>

            {/* Selector de Color */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-primary mb-3">
                Color: <span className="font-bold">{selectedColor?.name}</span>
              </h3>
              <div className="flex flex-wrap gap-3">
                {availableColors.map((color) => (
                  <button
                    key={color.id}
                    onClick={() => handleColorSelect(color)}
                    className="relative w-8 h-8 rounded-full border-2 transition-transform hover:scale-110 focus:outline-none"
                    style={{ backgroundColor: color.hex }}
                    aria-label={`Seleccionar color ${color.name}`}
                    data-selected={selectedColor?.id === color.id}
                  >
                    {selectedColor?.id === color.id && (
                      <span className="absolute inset-0 rounded-full ring-2 ring-offset-2 ring-accent"></span>
                    )}
                  </button>
                ))}
              </div>
            </div>

            {/* Selector de Tallas */}
            <div className="mt-8">
              <h3 className="text-sm font-medium text-primary mb-3">Talla:</h3>
              <div className="flex flex-wrap gap-3">
                {availableSizes.map((size) => {
                  const isAvailable = variants.some(
                    (v) =>
                      v.clothingSize.clothingColor.color.id === selectedColor?.id &&
                      v.clothingSize.size.id === size.id &&
                      v.clothingSize.quantity_available > 0
                  );
                  return (
                    <button
                      key={size.id}
                      onClick={() => handleSizeSelect(size)}
                      disabled={!isAvailable}
                      className="relative w-12 h-12 border rounded-md text-sm font-medium transition-colors focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 disabled:bg-gray-100 disabled:text-gray-400 disabled:cursor-not-allowed disabled:line-through hover:border-primary data-[selected=true]:bg-primary data-[selected=true]:text-white data-[selected=true]:border-primary"
                      data-selected={selectedSize?.id === size.id}
                    >
                      {size.name}
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Botón de Añadir al Carrito */}
            <button
              onClick={handleAddToCart}
              className="mt-10 w-full max-w-xs bg-accent text-white font-bold py-3 px-6 rounded-lg hover:bg-accent-hover transition-colors duration-300 shadow-md disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={
                !selectedVariant ||
                selectedVariant.clothingSize.quantity_available === 0
              }
            >
              {selectedVariant &&
                selectedVariant.clothingSize.quantity_available > 0
                ? "Añadir al Carrito"
                : "Agotado"}
            </button>
          </div>
        </div>
      </div>
    </section>
  );
}
