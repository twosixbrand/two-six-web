import Image from "next/image";
import Link from "next/link";
import { Button } from "@/components/ui/button";

interface SectionBannerProps {
    title: string;
    imageSrc: string;
    subtitle?: string;
    buttonText?: string;
    buttonHref?: string;
}

export function SectionBanner({ title, imageSrc, subtitle, buttonText, buttonHref }: SectionBannerProps) {
    return (
        <div className="relative w-full h-[50vh] min-h-[400px] flex items-center justify-center overflow-hidden mb-12">
            {/* Background Image with slight scale for "premium" feeling */}
            <Image
                src={imageSrc}
                alt={title}
                fill
                className="object-cover object-center scale-105"
                priority
            />

            {/* Dark overlay for text readability */}
            <div className="absolute inset-0 bg-black/40"></div>

            {/* Content */}
            <div className="relative z-10 flex flex-col items-center text-center px-4 w-full">
                <h1 className="text-4xl md:text-6xl lg:text-7xl font-serif font-bold text-secondary tracking-tight uppercase mb-4 animate-in fade-in slide-in-from-bottom-8 duration-1000">
                    {title}
                </h1>

                {subtitle && (
                    <p className="text-secondary/90 text-lg md:text-xl font-light tracking-widest max-w-2xl animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-150">
                        {subtitle}
                    </p>
                )}

                {buttonText && buttonHref && (
                    <div className="mt-8">
                        <Button
                            asChild
                            size="lg"
                            className="bg-accent/90 text-primary hover:bg-accent hover:scale-105 transition-all duration-300 px-8 py-6 text-lg animate-in fade-in slide-in-from-bottom-8 duration-1000 delay-300"
                        >
                            <Link href={buttonHref}>{buttonText}</Link>
                        </Button>
                    </div>
                )}
            </div>

            {/* Decorative line at bottom */}
            <div className="absolute bottom-0 left-0 w-full h-24 bg-gradient-to-t from-background to-transparent"></div>
        </div>
    );
}
