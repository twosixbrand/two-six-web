import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetailPage, { generateMetadata } from '../../src/app/product/[slug]/page';
import { notFound } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    notFound: jest.fn(),
    permanentRedirect: jest.fn(),
}));

// Mock ProductDetail component
jest.mock('../../src/components/ProductDetail', () => ({
    __esModule: true,
    default: ({ initialProduct, variants }: any) => (
        <div data-testid="mock-product-detail">
            Detail for {initialProduct?.name} with {variants?.length || 0} variants
        </div>
    )
}));

// Mock Breadcrumbs component
jest.mock('../../src/components/Breadcrumbs', () => ({
    __esModule: true,
    default: ({ items }: any) => (
        <div data-testid="mock-breadcrumbs">
            Breadcrumbs: {items.map((i: any) => i.label).join(' > ')}
        </div>
    )
}));

// Mock data fetching
jest.mock('../../src/data/products', () => ({
    getProductsBySlug: jest.fn(),
    getProductById: jest.fn(),
    getStoreDesigns: jest.fn()
}));

// Mock utils
jest.mock('../../src/utils/seoDictionary', () => ({
    getSeoOverrides: jest.fn(() => ({}))
}));

import { getProductsBySlug, getProductById } from '../../src/data/products';

describe('ProductDetailPage', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateMetadata', () => {
        it('returns "Página no encontrada" if slug is empty', async () => {
            const result = await generateMetadata({ params: Promise.resolve({ slug: '' }) });
            expect(result.title).toBe('Página no encontrada');
        });

        it('returns "Producto no encontrado" if product does not exist', async () => {
            (getProductsBySlug as jest.Mock).mockResolvedValueOnce({ products: [], colorId: null });
            (getProductById as jest.Mock).mockResolvedValueOnce(null);

            const result = await generateMetadata({ params: Promise.resolve({ slug: 'test-slug' }) });
            expect(result.title).toBe('Producto no encontrado');
        });

        it('returns proper metadata if product exists', async () => {
            (getProductsBySlug as jest.Mock).mockResolvedValueOnce({
                products: [{
                    id: 1,
                    name: 'Camiseta Cool',
                    description: 'Una camiseta muy cool',
                    clothingSize: { clothingColor: { color: { id: 1, name: 'Negro' } } }
                }],
                colorId: 1
            });

            const result = await generateMetadata({ params: Promise.resolve({ slug: 'camiseta-cool' }) });
            expect(result.title).toBe('Camiseta Cool');
            expect(result.description).toBe('Una camiseta muy cool');
        });
    });

    describe('Page Component', () => {
        it('calls notFound if slug is missing', async () => {
            (notFound as jest.Mock).mockImplementationOnce(() => { throw new Error('NOT_FOUND'); });
            await expect(ProductDetailPage({ params: Promise.resolve({ slug: '' }) })).rejects.toThrow('NOT_FOUND');
            expect(notFound).toHaveBeenCalled();
        });

        it('calls notFound if product does not exist and slug is not numeric', async () => {
            (getProductsBySlug as jest.Mock).mockResolvedValueOnce({ products: [], colorId: null });
            (notFound as jest.Mock).mockImplementationOnce(() => { throw new Error('NOT_FOUND'); });

            await expect(ProductDetailPage({ params: Promise.resolve({ slug: 'non-existent' }) })).rejects.toThrow('NOT_FOUND');
            expect(notFound).toHaveBeenCalled();
        });

        it('renders breadcrumbs and product details correctly for a valid slug', async () => {
            const mockProduct = {
                id: 1,
                name: 'Chaqueta Test',
                gender: 'Femenino',
                price: 100000,
                clothingSize: {
                    quantity_available: 5,
                    clothingColor: {
                        color: { id: 1, name: 'Rojo' },
                        design: {
                            reference: 'REF-123'
                        }
                    }
                }
            };

            (getProductsBySlug as jest.Mock).mockResolvedValueOnce({
                products: [mockProduct],
                colorId: 1
            });

            const ResolvedPage = await ProductDetailPage({ params: Promise.resolve({ slug: 'chaqueta-test' }) });
            render(ResolvedPage);

            expect(screen.getByTestId('mock-breadcrumbs')).toHaveTextContent('Breadcrumbs: Inicio > Femenino > Chaqueta Test');
            expect(screen.getByTestId('mock-product-detail')).toHaveTextContent('Detail for Chaqueta Test with 1 variants');
        });
    });
});
