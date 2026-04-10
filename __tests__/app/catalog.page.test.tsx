import React from 'react';
import { render, screen } from '@testing-library/react';
import FullCatalogPage from '../../src/app/catalog/page';

// Mock components
jest.mock('../../src/components/Catalog', () => ({
    __esModule: true,
    default: ({ products }: any) => <div data-testid="catalog-mock">Catalog with {products.length} products</div>
}));

jest.mock('../../src/components/SectionBanner', () => ({
    SectionBanner: ({ title }: any) => <div data-testid="banner-mock">{title}</div>
}));

// Mock data fetching
jest.mock('../../src/data/products', () => ({
    getStoreDesigns: jest.fn().mockResolvedValue({
        data: [{ id_product: 1, name: 'Product 1', slug: 'p1' }],
        meta: { total: 1, page: 1, totalPages: 1, limit: 12 }
    })
}));

describe('FullCatalogPage', () => {
    it('renders the catalog page with products', async () => {
        const ResolvedPage = await FullCatalogPage({ 
            searchParams: Promise.resolve({ page: '1' }) 
        });
        render(ResolvedPage);

        expect(screen.getByTestId('banner-mock')).toHaveTextContent('Catálogo Completo');
        expect(screen.getByTestId('catalog-mock')).toHaveTextContent('Catalog with 1 products');
    });

    it('handles different categories from searchParams', async () => {
        const { getStoreDesigns } = require('../../src/data/products');
        await FullCatalogPage({ 
            searchParams: Promise.resolve({ category: 'camisetas' }) 
        });
        
        expect(getStoreDesigns).toHaveBeenCalledWith(expect.objectContaining({
            category: 'camisetas'
        }));
    });
});
