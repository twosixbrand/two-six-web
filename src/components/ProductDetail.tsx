"use client"; // Este componente es interactivo y se ejecuta en el cliente

import { useState, useEffect } from "react";
import Image from "next/image";
import Link from "next/link";
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
  const { addToCart } = useCart();
  const [availableColors, setAvailableColors] = useState<Color[]>([]);
  const [availableSizes, setAvailableSizes] = useState<Size[]>([]);



  // La obtención de datos ahora se hace en el Server Component,
  // por lo que este useEffect ya no es necesario.

  const [currentImages, setCurrentImages] = useState<string[]>([]);

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

    const sizeOrder: { [key: string]: number } = { 'XS': 1, 'S': 2, 'M': 3, 'L': 4, 'XL': 5, 'XXL': 6, 'U': 7 };
    uniqueSizes.sort((a, b) => {
      const orderA = sizeOrder[a.name.toUpperCase()] || 99;
      const orderB = sizeOrder[b.name.toUpperCase()] || 99;
      if (orderA !== orderB) return orderA - orderB;
      return a.name.localeCompare(b.name, undefined, { numeric: true, sensitivity: 'base' });
    });

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
            {/* Contenedor móvil: scroll horizontal, contenedor desktop: grid */}
            <div className="flex overflow-x-auto snap-x snap-mandatory md:grid md:grid-cols-2 gap-4 pb-4 md:pb-0 hide-scrollbar">
              {/* Imagen Principal */}
              <div className="relative aspect-[3/4] w-full min-w-[85vw] md:min-w-0 md:col-span-2 rounded-xl overflow-hidden shadow-sm bg-white snap-center shrink-0">
                <Image
                  src={currentImages[0] || "/placeholder.png"}
                  alt={initialProduct.name}
                  fill
                  className="object-cover object-center"
                  priority
                  unoptimized
                  quality={100}
                />
              </div>

              {/* Imágenes Secundarias */}
              {currentImages.slice(1).map((img, idx) => (
                <div key={idx} className="relative aspect-[3/4] w-full min-w-[85vw] md:min-w-0 rounded-xl overflow-hidden shadow-sm bg-white snap-center shrink-0">
                  <Image
                    src={img}
                    alt={`${initialProduct.name} - Detalle ${idx + 2}`}
                    fill
                    className="object-cover object-center transition-transform hover:scale-105 duration-700"
                    unoptimized
                    quality={100}
                  />
                </div>
              ))}
            </div>

            {/* Indicadores simples para scroll móvil (opcional/visual) */}
            {currentImages.length > 1 && (
              <div className="flex md:hidden justify-center space-x-2 mt-[-10px] mb-4">
                {currentImages.map((_, i) => (
                  <div key={i} className="h-1.5 w-1.5 rounded-full bg-primary/20"></div>
                ))}
              </div>
            )}
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
                  <Link href="/guia-tallas-camisetas" className="text-xs text-muted-foreground underline hover:text-primary transition-colors">
                    Guía de tallas
                  </Link>
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
                      <li>Diseñado y confeccionado con orgullo en Medellín, Colombia.</li>
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

                <AccordionItem value="care">
                  <AccordionTrigger className="text-base uppercase tracking-wider hover:no-underline hover:text-accent">
                    Instrucciones de Cuidado
                  </AccordionTrigger>
                  <AccordionContent className="text-muted-foreground leading-relaxed text-sm pt-2">
                    <ul className="space-y-2 mb-4">
                      <li><strong className="text-primary font-medium">Lavado:</strong> Lave a mano para proteger las fibras y el color.</li>
                      <li><strong className="text-primary font-medium">Jabón:</strong> Use jabón suave; evite detergentes agresivos o blanqueadores.</li>
                      <li><strong className="text-primary font-medium">Tratamiento:</strong> No retuerza la prenda para escurrirla, ya que esto puede deformar el tejido.</li>
                      <li><strong className="text-primary font-medium">Remojo:</strong> No deje la prenda en remojo por tiempos prolongados.</li>
                      <li><strong className="text-primary font-medium">Secado:</strong> Seque a la sombra. La exposición directa al sol puede desgastar los tonos oscuros.</li>
                    </ul>

                    {/* Iconos Universales de Lavado */}
                    <div className="flex items-center gap-5 mt-5 text-primary border-t border-border pt-5">
                      {/* 1. Lave a mano (Tina con mano) */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <title>Lavado manual</title>
                        <path d="M3 9l1.5 9h15l1.5-9" />
                        <path d="M3 9h18" />
                        <path d="M15.5 5.5A2.5 2.5 0 0 0 13 8v3" />
                        <path d="M12 9V4a2 2 0 0 0-4 0v5" />
                        <path d="M10 6.5a2 2 0 0 0-4 0v3" />
                      </svg>
                      {/* 2. No usar blanqueador (Triángulo tachado) */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <title>No usar blanqueador</title>
                        <path d="M12 3l9 15H3z" />
                        <path d="M4 4l16 16" />
                      </svg>
                      {/* 3. No usar secadora (Cuadrado con círculo tachado) */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <title>No usar secadora</title>
                        <rect x="3" y="3" width="18" height="18" rx="2" ry="2" />
                        <circle cx="12" cy="12" r="5" />
                        <path d="M4 4l16 16" />
                      </svg>
                      {/* 4. Plancha tibia/suave (Plancha con un punto) */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <title>Plancha tibia/suave</title>
                        <path d="M5 16h14a2 2 0 0 0 2-2v-2a6 6 0 0 0-6-6H7a2 2 0 0 0-2 2v6a2 2 0 0 0 2 2z" />
                        <path d="M5 16v2a2 2 0 0 0 2 2h10a2 2 0 0 0 2-2v-2" />
                        <circle cx="12" cy="12" r="1.5" fill="currentColor" />
                      </svg>
                      {/* 5. No lavar en seco (Círculo tachado) */}
                      <svg width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round">
                        <title>No lavar en seco</title>
                        <circle cx="12" cy="12" r="9" />
                        <path d="M5.5 5.5l13 13" />
                      </svg>
                    </div>
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
