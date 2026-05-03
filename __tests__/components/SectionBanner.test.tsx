import React from 'react';
import { render, screen } from '@testing-library/react';
import { SectionBanner } from '../../src/components/SectionBanner';

// Mock next/image

describe('SectionBanner component', () => {

    it('renders with title and image', () => {
        render(
            <SectionBanner
                title="Nueva Sección"
                imageSrc="http://test.com/banner.jpg"
            />
        );

        expect(screen.getByText('Nueva Sección')).toBeInTheDocument();

        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', 'http://test.com/banner.jpg');
        expect(image).toHaveAttribute('alt', 'Nueva Sección');
    });

    it('renders with subtitle if provided', () => {
        render(
            <SectionBanner
                title="Nueva Sección"
                imageSrc="http://test.com/banner.jpg"
                subtitle="Explora ahora"
            />
        );

        expect(screen.getByText('Explora ahora')).toBeInTheDocument();
    });

    it('does not render subtitle element if subtitle is not provided', () => {
        render(
            <SectionBanner
                title="Nueva Sección"
                imageSrc="http://test.com/banner.jpg"
            />
        );

        // Let's assume there is no <p> rendered based on the component logic if no subtitle prop
        const paragraphs = screen.queryAllByText((content, element) => element?.tagName.toLowerCase() === 'p');
        // Based on SectionBanner.tsx, if there is no subtitle, no text <p> is rendered at all
        expect(paragraphs.length).toBe(0);
    });
});
