import React from 'react';
import { render, screen } from '@testing-library/react';
import ProductDetailPage, { generateMetadata } from '../../src/app/product/[id]/page';
import { notFound } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
    notFound: jest.fn(),
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
    getProductById: jest.fn(),
    getProductsByDesignReference: jest.fn()
}));

import { getProductById, getProductsByDesignReference } from '../../src/data/products';

describe('ProductDetailPage', () => {

    beforeEach(() => {
        jest.clearAllMocks();
    });

    describe('generateMetadata', () => {
        it('returns "Página no encontrada" if id is NaN', async () => {
            const result = await generateMetadata({ params: Promise.resolve({ id: 'abc' }) });
            expect(result.title).toBe('Página no encontrada');
        });

        it('returns "Producto no encontrado" if product does not exist', async () => {
            (getProductById as jest.Mock).mockResolvedValueOnce(null);

            const result = await generateMetadata({ params: Promise.resolve({ id: '999' }) });
            expect(result.title).toBe('Producto no encontrado');
        });

        it('returns proper metadata if product exists', async () => {
            (getProductById as jest.Mock).mockResolvedValueOnce({
                id: 1,
                name: 'Camiseta Cool',
                description: 'Una camiseta muy cool'
            });

            const result = await generateMetadata({ params: Promise.resolve({ id: '1' }) });
            expect(result.title).toBe('Camiseta Cool | Two Six Brand');
            expect(result.description).toBe('Una camiseta muy cool');
        });
    });

    describe('Page Component', () => {
        it('calls notFound if id is NaN', async () => {
            (notFound as jest.Mock).mockImplementationOnce(() => { throw new Error('NOT_FOUND'); });
            await expect(ProductDetailPage({ params: Promise.resolve({ id: 'invalid' }) })).rejects.toThrow('NOT_FOUND');
            expect(notFound).toHaveBeenCalled();
        });

        it('calls notFound if product does not exist', async () => {
            (getProductById as jest.Mock).mockResolvedValueOnce(null);
            (notFound as jest.Mock).mockImplementationOnce(() => { throw new Error('NOT_FOUND'); });

            await expect(ProductDetailPage({ params: Promise.resolve({ id: '999' }) })).rejects.toThrow('NOT_FOUND');
            expect(notFound).toHaveBeenCalled();
        });

        it('renders breadcrumbs and product details correctly for a valid product', async () => {
            const mockProduct = {
                id: 1,
                name: 'Chaqueta Test',
                gender: 'Femenino',
                clothingSize: {
                    clothingColor: {
                        design: {
                            reference: 'REF-123'
                        }
                    }
                }
            };

            const mockVariants = [
                { id: 1, name: 'Chaqueta Test' },
                { id: 2, name: 'Chaqueta Test (Otro color)' }
            ];

            (getProductById as jest.Mock).mockResolvedValueOnce(mockProduct);
            (getProductsByDesignReference as jest.Mock).mockResolvedValueOnce(mockVariants);

            const ResolvedPage = await ProductDetailPage({ params: Promise.resolve({ id: '1' }) });
            render(ResolvedPage);

            expect(screen.getByTestId('mock-breadcrumbs')).toHaveTextContent('Breadcrumbs: Inicio > Femenino > Chaqueta Test');
            expect(screen.getByTestId('mock-product-detail')).toHaveTextContent('Detail for Chaqueta Test with 2 variants');
        });

        it('handles default gender properly when gender is missing or unknown', async () => {
            const mockProduct = {
                id: 2,
                name: 'Botones',
                clothingSize: {
                    clothingColor: {
                        design: {
                            reference: 'REF-BTN'
                        }
                    }
                }
            };

            (getProductById as jest.Mock).mockResolvedValueOnce(mockProduct);
            (getProductsByDesignReference as jest.Mock).mockResolvedValueOnce([]);

            const ResolvedPage = await ProductDetailPage({ params: Promise.resolve({ id: '2' }) });
            render(ResolvedPage);

            expect(screen.getByTestId('mock-breadcrumbs')).toHaveTextContent('Breadcrumbs: Inicio > Unisex > Botones');
        });
    });
});
