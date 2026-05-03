import React from 'react';
import { render, screen } from '@testing-library/react';
import { HeroCarousel } from '../../src/components/HeroCarousel';

// Mock next/image

// Mock matchMedia for Embla Carousel
Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: jest.fn().mockImplementation(query => ({
        matches: false,
        media: query,
        onchange: null,
        addListener: jest.fn(), // Deprecated
        removeListener: jest.fn(), // Deprecated
        addEventListener: jest.fn(),
        removeEventListener: jest.fn(),
        dispatchEvent: jest.fn(),
    })),
});

// Mock IntersectionObserver for Embla Carousel
class IntersectionObserver {
    observe = jest.fn()
    disconnect = jest.fn()
    unobserve = jest.fn()
}

Object.defineProperty(window, 'IntersectionObserver', {
    writable: true,
    configurable: true,
    value: IntersectionObserver,
});

// Mock ResizeObserver for Embla Carousel
class ResizeObserver {
    observe = jest.fn()
    disconnect = jest.fn()
    unobserve = jest.fn()
}

Object.defineProperty(window, 'ResizeObserver', {
    writable: true,
    configurable: true,
    value: ResizeObserver,
});

describe('HeroCarousel component', () => {

    it('renders the carousel with all slides', () => {
        render(<HeroCarousel />);

        // Check if main slide titles are present
        expect(screen.getByText('Calidad que impone')).toBeInTheDocument();
        expect(screen.getByText('Essentials Hombre')).toBeInTheDocument();
        expect(screen.getByText('Edición Limitada')).toBeInTheDocument();

        // Check if CTA links are present and have correct hrefs
        const linkWo = screen.getByRole('link', { name: 'Ver Colección' });
        expect(linkWo).toHaveAttribute('href', '/woman?sort=new');

        const linkMan = screen.getByRole('link', { name: 'Comprar Ahora' });
        expect(linkMan).toHaveAttribute('href', '/man');

        const linkUni = screen.getByRole('link', { name: 'Descubrir' });
        expect(linkUni).toHaveAttribute('href', '/unisex');
    });

    it('renders carousel navigation buttons on desktop', () => {
        render(<HeroCarousel />);

        // The default Carousel components from shadcn usually come with 
        // aria-labels like "Previous slide" and "Next slide"
        const prevButton = screen.getByRole('button', { name: /previous/i });
        const nextButton = screen.getByRole('button', { name: /next/i });

        expect(prevButton).toBeInTheDocument();
        expect(nextButton).toBeInTheDocument();
    });
});
