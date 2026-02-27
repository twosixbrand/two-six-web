import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import CartItem from '../../src/components/CartItem';

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} priority={undefined} fetchPriority={undefined} />;
    },
}));

const mockFormatPrice = (price: number) => `$${price.toLocaleString()}`;

describe('CartItem component', () => {

    // eslint-disable-next-line @typescript-eslint/no-explicit-any
    const createMockItem = (overrides: any = {}) => ({
        id: 1,
        name: 'Pantalón Test',
        price: 80000,
        quantity: 1,
        clothingSize: {
            size: { name: '32' },
            clothingColor: {
                color: { name: 'Azul' },
                image_url: 'http://test.com/img2.png',
                imageClothing: []
            }
        },
        ...overrides
    });

    const mockUpdateQuantity = jest.fn();
    const mockRemoveFromCart = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('renders cart item details correctly', () => {
        const item = createMockItem();
        render(
            <CartItem
                item={item}
                updateQuantity={mockUpdateQuantity}
                removeFromCart={mockRemoveFromCart}
                formatPrice={mockFormatPrice}
            />
        );

        expect(screen.getByText('Pantalón Test')).toBeInTheDocument();
        expect(screen.getByText('Color: Azul / Talla: 32')).toBeInTheDocument();

        // Single unit price
        expect(screen.getByText('$80,000', { selector: '.text-accent' })).toBeInTheDocument();
        // Subtotal
        expect(screen.getByText('$80,000', { selector: '.mb-2' })).toBeInTheDocument();

        const image = screen.getByRole('img');
        expect(image).toHaveAttribute('src', 'http://test.com/img2.png');
        expect(image).toHaveAttribute('alt', 'Pantalón Test');
    });

    it('calls updateQuantity when plus button is clicked', async () => {
        const user = userEvent.setup();
        const item = createMockItem();
        render(
            <CartItem
                item={item}
                updateQuantity={mockUpdateQuantity}
                removeFromCart={mockRemoveFromCart}
                formatPrice={mockFormatPrice}
            />
        );

        const increaseBtn = screen.getByLabelText('Aumentar cantidad');
        await user.click(increaseBtn);

        expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 2);
    });

    it('calls updateQuantity when minus button is clicked', async () => {
        const user = userEvent.setup();
        const item = createMockItem({ quantity: 2 });
        render(
            <CartItem
                item={item}
                updateQuantity={mockUpdateQuantity}
                removeFromCart={mockRemoveFromCart}
                formatPrice={mockFormatPrice}
            />
        );

        const decreaseBtn = screen.getByLabelText('Reducir cantidad');
        await user.click(decreaseBtn);

        expect(mockUpdateQuantity).toHaveBeenCalledWith(1, 1);
    });

    it('calls removeFromCart when delete button is clicked', async () => {
        const user = userEvent.setup();
        const item = createMockItem();
        render(
            <CartItem
                item={item}
                updateQuantity={mockUpdateQuantity}
                removeFromCart={mockRemoveFromCart}
                formatPrice={mockFormatPrice}
            />
        );

        const deleteBtn = screen.getByLabelText(`Eliminar ${item.name}`);
        await user.click(deleteBtn);

        expect(mockRemoveFromCart).toHaveBeenCalledWith(1);
    });

    it('handles image load error by setting placeholder', () => {
        const item = createMockItem();
        render(
            <CartItem
                item={item}
                updateQuantity={mockUpdateQuantity}
                removeFromCart={mockRemoveFromCart}
                formatPrice={mockFormatPrice}
            />
        );

        const image = screen.getByRole('img');
        fireEvent.error(image);

        expect(image).toHaveAttribute('src', '/placeholder.png');
    });

    it('uses item.image_url as primary image source', () => {
        const item = createMockItem({ image_url: '/primary-img.jpg' });
        render(
            <CartItem
                item={item}
                updateQuantity={mockUpdateQuantity}
                removeFromCart={mockRemoveFromCart}
                formatPrice={mockFormatPrice}
            />
        );
        expect(screen.getByRole('img')).toHaveAttribute('src', '/primary-img.jpg');
    });

    it('falls back to imageClothing[0] when image_url is missing', () => {
        const item = createMockItem({
            image_url: undefined,
            clothingSize: {
                size: { name: '32' },
                clothingColor: {
                    color: { name: 'Azul' },
                    image_url: 'http://test.com/color-fallback.png',
                    imageClothing: [{ image_url: 'http://test.com/clothing-img.png' }],
                },
            },
        });
        render(
            <CartItem
                item={item}
                updateQuantity={mockUpdateQuantity}
                removeFromCart={mockRemoveFromCart}
                formatPrice={mockFormatPrice}
            />
        );
        expect(screen.getByRole('img')).toHaveAttribute('src', 'http://test.com/clothing-img.png');
    });

    it('falls back to clothingColor.image_url when imageClothing is empty', () => {
        const item = createMockItem({
            image_url: undefined,
            clothingSize: {
                size: { name: '32' },
                clothingColor: {
                    color: { name: 'Azul' },
                    image_url: 'http://test.com/color-fallback.png',
                    imageClothing: [],
                },
            },
        });
        render(
            <CartItem
                item={item}
                updateQuantity={mockUpdateQuantity}
                removeFromCart={mockRemoveFromCart}
                formatPrice={mockFormatPrice}
            />
        );
        expect(screen.getByRole('img')).toHaveAttribute('src', 'http://test.com/color-fallback.png');
    });

    it('falls back to placeholder when all image sources are missing', () => {
        const item = createMockItem({
            image_url: undefined,
            clothingSize: {
                size: { name: '32' },
                clothingColor: {
                    color: { name: 'Azul' },
                    image_url: undefined,
                    imageClothing: [],
                },
            },
        });
        render(
            <CartItem
                item={item}
                updateQuantity={mockUpdateQuantity}
                removeFromCart={mockRemoveFromCart}
                formatPrice={mockFormatPrice}
            />
        );
        expect(screen.getByRole('img')).toHaveAttribute('src', '/placeholder.png');
    });
});
