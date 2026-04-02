import React from 'react';
import { render, screen } from '@testing-library/react';
import UnisexPage from '../../src/app/unisex/page';
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

describe('Unisex Category Page', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders the banner and catalog with fetched products', async () => {
        const mockProducts = [
            { id: 1, name: 'Gorra Unisex 1' },
            { id: 2, name: 'Sudadera Unisex 1' }
        ];

        (getStoreDesigns as jest.Mock).mockResolvedValue({
            data: mockProducts,
            meta: { total: 2, page: 1, totalPages: 1, limit: 12 }
        });

        // Pass searchParams as a Promise
        const ResolvedPage = await UnisexPage({ searchParams: Promise.resolve({}) });
        render(ResolvedPage);

        // Verify the data fetching was called with correct arguments
        expect(getStoreDesigns).toHaveBeenCalledWith(
            expect.objectContaining({ gender: 'UNISEX', isOutlet: false })
        );

        // Verify banner
        const banner = screen.getByTestId('mock-section-banner');
        expect(banner).toBeInTheDocument();
        expect(banner).toHaveTextContent('Banner: Unisex - Prendas estéticas sin definiciones.');

        // Verify catalog
        const catalog = screen.getByTestId('mock-catalog');
        expect(catalog).toBeInTheDocument();
        expect(catalog).toHaveTextContent('Catalog rendering 2 items');
    });

    it('handles empty products gracefully', async () => {
        (getStoreDesigns as jest.Mock).mockResolvedValue({
            data: [],
            meta: { total: 0, page: 1, totalPages: 1, limit: 12 }
        });

        const ResolvedPage = await UnisexPage({ searchParams: Promise.resolve({}) });
        render(ResolvedPage);

        const catalog = screen.getByTestId('mock-catalog');
        expect(catalog).toBeInTheDocument();
        expect(catalog).toHaveTextContent('Catalog rendering 0 items');
    });
});
