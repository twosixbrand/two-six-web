"use client";

import * as React from "react";
import Image from "next/image";
import { Button } from "@/components/ui/button";
import {
    Carousel,
    CarouselContent,
    CarouselItem,
    CarouselNext,
    CarouselPrevious,
} from "@/components/ui/carousel";
import Autoplay from "embla-carousel-autoplay";
import Link from "next/link";

const heroSlides = [
    {
        id: 1,
        image: "https://twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com/twosixweb.com/banner1.png",
        title: "Nueva Colección",
        subtitle: "Define tu propio estándar.",
        cta: "Explorar Novedades",
        link: "/woman?sort=new"
    },
    {
        id: 2,
        image: "https://twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com/twosixweb.com/banner2.png",
        title: "Essentials Hombre",
        subtitle: "Clásicos reinventados para el día a día.",
        cta: "Ver Colección",
        link: "/man"
    },
    {
        id: 3,
        image: "https://twosix-catalog-storage.atl1.cdn.digitaloceanspaces.com/twosixweb.com/banner3.png",
        title: "Edición Limitada",
        subtitle: "Piezas exclusivas. Tiempo limitado.",
        cta: "Descubrir",
        link: "/unisex"
    }
];

export function HeroCarousel() {
    const plugin = React.useRef(
        Autoplay({ delay: 5000, stopOnInteraction: true })
    );

    return (
        <Carousel
            plugins={[plugin.current]}
            className="w-full h-[80vh] min-h-[600px] relative"
            onMouseEnter={plugin.current.stop}
            onMouseLeave={plugin.current.reset}
        >
            <CarouselContent>
                {heroSlides.map((slide) => (
                    <CarouselItem key={slide.id}>
                        <div className="relative w-full h-[80vh] min-h-[600px] overflow-hidden">
                            <Image
                                src={slide.image}
                                alt={slide.title}
                                fill
                                priority={slide.id === 1}
                                className="object-cover object-center"
                            />
                            <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>

                            <div className="absolute inset-0 flex flex-col items-center justify-center text-center px-4">
                                <h1 className="text-secondary font-serif text-5xl md:text-7xl lg:text-8xl mb-4 font-bold tracking-tight animate-in fade-in slide-in-from-bottom-8 duration-1000">
                                    {slide.title}
                                </h1>
                                <p className="text-secondary/90 text-lg md:text-xl lg:text-2xl mb-8 max-w-2xl font-light tracking-wide animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                                    {slide.subtitle}
                                </p>
                                <Button
                                    asChild
                                    size="lg"
                                    className="bg-accent/90 text-primary hover:bg-accent hover:scale-105 transition-all duration-300 px-8 py-6 text-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300"
                                >
                                    <Link href={slide.link}>{slide.cta}</Link>
                                </Button>
                            </div>
                        </div>
                    </CarouselItem>
                ))}
            </CarouselContent>
            <div className="hidden md:block">
                <CarouselPrevious className="left-8 w-12 h-12 bg-white/10 hover:bg-white/20 border-white/20 text-white" />
                <CarouselNext className="right-8 w-12 h-12 bg-white/10 hover:bg-white/20 border-white/20 text-white" />
            </div>
        </Carousel>
    );
}
