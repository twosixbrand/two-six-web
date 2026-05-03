import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import CheckoutSummaryItem from '../../src/components/CheckoutSummaryItem';

// Mock next/image

const mockFormatPrice = (price: number) => `$${price.toLocaleString()}`;

describe('CheckoutSummaryItem component', () => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createMockItem = (overrides: any = {}) => ({
        id: '1',
        name: 'Camiseta Test',
        price: 50000,
        quantity: 2,
        clothingSize: {
            size: { name: 'M' },
            clothingColor: {
                color: { name: 'Rojo' },
                image_url: 'http://test.com/img1.png',
                imageClothing: []
            }
        },
        ...overrides
    });

    it('renders item details correctly', () => {
        const item = createMockItem();
        render(<CheckoutSummaryItem item={item} formatPrice={mockFormatPrice} />);

        expect(screen.getByText('Camiseta Test')).toBeInTheDocument();
        expect(screen.getByText('Rojo / M x 2')).toBeInTheDocument();
        expect(screen.getByText('$100,000')).toBeInTheDocument(); // 50000 * 2

        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', 'http://test.com/img1.png');
        expect(image).toHaveAttribute('alt', 'Camiseta Test');
    });

    it('falls back to placeholder image if no image is provided', () => {
        const item = createMockItem({
            clothingSize: {
                size: { name: 'M' },
                clothingColor: {
                    color: { name: 'Rojo' },
                    image_url: null,
                    imageClothing: []
                }
            }
        });

        render(<CheckoutSummaryItem item={item} formatPrice={mockFormatPrice} />);

        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', '/placeholder.png');
    });

    it('handles image load error by setting placeholder', () => {
        const item = createMockItem();
        render(<CheckoutSummaryItem item={item} formatPrice={mockFormatPrice} />);

        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', 'http://test.com/img1.png');

        fireEvent.error(image);

        expect(image).toHaveAttribute('src', '/placeholder.png');
    });
});
