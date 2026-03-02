"use client"; // Este componente es interactivo y se ejecuta en el cliente

import { useState, useEffect } from "react";
import { ChevronDownIcon } from "@heroicons/react/24/solid";
import Image from "next/image";
import { useCart } from "@/context/CartContext";
import type { Product, Color, Size } from "@/types"; // Asumiendo que tienes un archivo de tipos
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import { Button } from "@/components/ui/button";

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

  const [openAccordion, setOpenAccordion] = useState<string | null>(
    "description"
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
    // Al cargar la vista de detalle de producto, asegurar que nos posicionamos al inicio de la página.
    window.scrollTo({ top: 0, behavior: 'smooth' });

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
    <section className="bg-secondary/20 py-8 md:py-16 min-h-screen font-sans">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8 max-w-[1400px]">
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-10 lg:gap-16 items-start">

          {/* Columna Izquierda: Galería de Imágenes (7 columnas) */}
          <div className="lg:col-span-7 flex flex-col gap-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Imagen Principal en Móvil / Primera en Desktop */}
              <div className="relative aspect-[3/4] md:col-span-2 rounded-xl overflow-hidden shadow-sm bg-white">
                <Image
                  src={currentImages[0] || "/placeholder.png"}
                  alt={initialProduct.name}
                  fill
                  className="object-cover object-center"
                  priority
                />
              </div>

              {/* Imágenes Secundarias flotantes estilo grid estricto */}
              {currentImages.slice(1).map((img, idx) => (
                <div key={idx} className="relative aspect-[3/4] rounded-xl overflow-hidden shadow-sm bg-white hidden md:block">
                  <Image
                    src={img}
                    alt={`${initialProduct.name} - Detalle ${idx + 2}`}
                    fill
                    className="object-cover object-center transition-transform hover:scale-105 duration-700"
                  />
                </div>
              ))}
            </div>
          </div>

          {/* Columna Derecha: Sticky Info (5 columnas) */}
          <div className="lg:col-span-5 lg:sticky lg:top-32 flex flex-col">
            <div className="mb-2">
              <span className="text-sm tracking-widest uppercase text-muted-foreground font-medium">
                Edición {initialProduct.gender || 'Unisex'}
              </span>
            </div>

            <h1 className="text-3xl sm:text-4xl md:text-5xl font-serif font-semibold text-primary mb-4 leading-tight">
              {initialProduct.name}
            </h1>

            <p className="text-2xl font-medium text-accent mb-8">
              {formattedPrice}
            </p>

            <div className="h-px w-full bg-border mb-8"></div>

            {/* Selectores agrupados */}
            <div className="space-y-8 mb-10">

              {/* Box Color */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Color</h3>
                  <span className="text-sm text-muted-foreground">{selectedColor?.name}</span>
                </div>
                <div className="flex flex-wrap gap-3">
                  {availableColors.map((color) => (
                    <button
                      key={color.id}
                      onClick={() => handleColorSelect(color)}
                      className={`relative w-10 h-10 rounded-full border-2 transition-all focus:outline-none focus:ring-2 focus:ring-accent focus:ring-offset-2 ${selectedColor?.id === color.id ? 'border-primary ring-2 ring-primary ring-offset-1 scale-110' : 'border-gray-200 hover:scale-105'}`}
                      style={{ backgroundColor: color.hex }}
                      aria-label={`Seleccionar color ${color.name}`}
                    >
                    </button>
                  ))}
                </div>
              </div>

              {/* Box Tallas */}
              <div>
                <div className="flex items-center justify-between mb-3">
                  <h3 className="text-sm font-semibold text-primary uppercase tracking-wider">Talla</h3>
                  <button className="text-xs text-muted-foreground underline hover:text-primary transition-colors">Guía de tallas</button>
                </div>
                <div className="grid grid-cols-4 sm:grid-cols-5 gap-3">
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
                        className={`
                          py-3 border text-sm font-medium transition-all duration-200 
                          ${!isAvailable ? 'bg-secondary/50 text-muted-foreground/50 border-border/50 cursor-not-allowed line-through' : ''}
                          ${selectedSize?.id === size.id && isAvailable ? 'bg-primary text-secondary border-primary shadow-md' : ''}
                          ${selectedSize?.id !== size.id && isAvailable ? 'bg-white text-primary border-border hover:border-primary hover:bg-secondary/50' : ''}
                        `}
                      >
                        {size.name}
                      </button>
                    );
                  })}
                </div>
              </div>
            </div>

            {/* Añadir al Carrito (Shadcn Button) */}
            <Button
              size="lg"
              onClick={handleAddToCart}
              className="w-full py-6 text-lg uppercase tracking-wider bg-accent text-primary hover:bg-accent/90 transition-all shadow-xl hover:shadow-accent/20"
              disabled={
                !selectedVariant ||
                selectedVariant.clothingSize.quantity_available === 0
              }
            >
              {selectedVariant && selectedVariant.clothingSize.quantity_available > 0
                ? "Añadir a la Bolsa"
                : "Agotado"}
            </Button>

            {/* Acordeones Shadcn para detalles extra */}
            <div className="mt-12 text-sm">
              <Accordion type="single" collapsible className="w-full" defaultValue="description">
                <AccordionItem value="description">
                  <AccordionTrigger className="text-base uppercase tracking-wider hover:no-underline hover:text-accent">
                    Descripción
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-2">
                    {initialProduct.description}
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="details">
                  <AccordionTrigger className="text-base uppercase tracking-wider hover:no-underline hover:text-accent">
                    Detalles del Producto
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-2">
                    <ul className="list-disc pl-5 space-y-1">
                      <li>Referencia: {initialProduct.clothingSize.clothingColor.design.reference}</li>
                      <li>Ajuste Regular</li>
                      <li>Materiales Premium</li>
                    </ul>
                  </AccordionContent>
                </AccordionItem>

                <AccordionItem value="shipping">
                  <AccordionTrigger className="text-base uppercase tracking-wider hover:no-underline hover:text-accent">
                    Envíos y Devoluciones
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-2">
                    Ofrecemos cambios gratuitos en los primeros 15 días tras la compra. El envío estándar toma de 3 a 5 días hábiles a nivel nacional.
                  </AccordionContent>
                </AccordionItem>
              </Accordion>
            </div>

          </div>
        </div>
      </div>
    </section>
  );
}
