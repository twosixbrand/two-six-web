import { render, screen, fireEvent } from '@testing-library/react';
import ProductCard from './ProductCard';

const mockProduct = {
    id_product: 1,
    name: 'Test Shirt',
    price: 85000,
    image_url: 'http://image.com/shirt.jpg',
    slug: 'test-shirt'
};

describe('ProductCard', () => {
    it('renders product information correctly', () => {
        render(<ProductCard product={mockProduct as any} />);

        expect(screen.getByText('Test Shirt')).toBeInTheDocument();
        // Check for formatted price (approximate match to handle different locales)
        expect(screen.getByText(/85/)).toBeInTheDocument();
        
        const img = screen.getByAltText('Test Shirt');
        expect(img).toHaveAttribute('src', expect.stringContaining('shirt.jpg'));
    });

    it('uses slug for link if available', () => {
        render(<ProductCard product={mockProduct as any} />);
        const link = screen.getByRole('link');
        expect(link).toHaveAttribute('href', '/product/test-shirt');
    });

    it('falls back to placeholder on image error', () => {
        render(<ProductCard product={mockProduct as any} />);
        const img = screen.getByAltText('Test Shirt');
        
        fireEvent.error(img);
        
        expect(img).toHaveAttribute('src', expect.stringContaining('placeholder.png'));
    });
});
