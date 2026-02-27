import React from 'react';
import { render, screen } from '@testing-library/react';
import WomanPage from '../../src/app/woman/page';
import { getStoreDesigns } from '../../src/data/products';

// Mock SectionBanner
jest.mock('../../src/components/SectionBanner', () => ({
    SectionBanner: ({ title, subtitle }: any) => (
        <div data-testid="mock-section-banner">
            Banner: {title} - {subtitle}
        </div>
    )
}));

// Mock Catalog
jest.mock('../../src/components/Catalog', () => ({
    __esModule: true,
    default: ({ products }: any) => (
        <div data-testid="mock-catalog">
            Catalog rendering {products?.length || 0} items
        </div>
    )
}));

// Mock Data fetching
jest.mock('../../src/data/products', () => ({
    getStoreDesigns: jest.fn()
}));

describe('Woman Category Page', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the banner and catalog with fetched products', async () => {
        // Mock the resolved data from getStoreDesigns
        const mockProducts = [
            { id: 1, name: 'Blusa Mujer 1' },
            { id: 2, name: 'Falda Mujer 1' }
        ];

        (getStoreDesigns as jest.Mock).mockResolvedValueOnce(mockProducts);

        // Await the SSR component
        const ResolvedPage = await WomanPage();
        render(ResolvedPage);

        // Verify the data fetching was called with correct arguments
        expect(getStoreDesigns).toHaveBeenCalledWith({ gender: 'FEMENINO', isOutlet: false });

        // Verify banner
        const banner = screen.getByTestId('mock-section-banner');
        expect(banner).toBeInTheDocument();
        expect(banner).toHaveTextContent('Banner: Mujer - Elegancia, comodidad y versatilidad.');

        // Verify catalog
        const catalog = screen.getByTestId('mock-catalog');
        expect(catalog).toBeInTheDocument();
        expect(catalog).toHaveTextContent('Catalog rendering 2 items');
    });

    it('handles empty products gracefully', async () => {
        (getStoreDesigns as jest.Mock).mockResolvedValueOnce([]);

        const ResolvedPage = await WomanPage();
        render(ResolvedPage);

        const catalog = screen.getByTestId('mock-catalog');
        expect(catalog).toBeInTheDocument();
        expect(catalog).toHaveTextContent('Catalog rendering 0 items');
    });
});
