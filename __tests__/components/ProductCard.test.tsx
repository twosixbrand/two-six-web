import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from '../../src/components/ProductCard';

describe('ProductCard component', () => {
    const mockProduct = {
        id_design: 1,
        id_product: 10,
        name: 'Camiseta Test',
        price: 75000,
        image_url: '/test-product.jpg',
    };

    it('renders product name', () => {
        render(<ProductCard product={mockProduct as any} />);
        expect(screen.getByText('Camiseta Test')).toBeInTheDocument();
    });

    it('renders formatted price in COP', () => {
        render(<ProductCard product={mockProduct as any} />);
        // Should contain $75.000 or similar COP format
        const priceEl = screen.getByText(/75/);
        expect(priceEl).toBeInTheDocument();
    });

    it('links to the correct product page', () => {
        render(<ProductCard product={mockProduct as any} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/product/10');
    });

    it('renders product image', () => {
        render(<ProductCard product={mockProduct as any} />);
        const img = screen.getByTestId('product-img');
        expect(img).toHaveAttribute('src', '/test-product.jpg');
    });

    it('falls back to placeholder on image error', () => {
        render(<ProductCard product={mockProduct as any} />);
        const img = screen.getByTestId('product-img');
        // Trigger the onError handler
        fireEvent.error(img);
        expect(img).toHaveAttribute('src', '/placeholder.png');
    });

    it('uses placeholder when no image_url provided', () => {
        const noImgProduct = { ...mockProduct, image_url: '' };
        render(<ProductCard product={noImgProduct as any} />);
        const img = screen.getByTestId('product-img');
        expect(img).toHaveAttribute('src', '/placeholder.png');
    });
});
