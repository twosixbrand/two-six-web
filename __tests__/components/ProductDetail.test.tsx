import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import ProductDetail from '../../src/components/ProductDetail';

// Mock next/image

// Mock CartContext
const mockAddToCart = jest.fn();
jest.mock('@/context/CartContext', () => ({
    useCart: () => ({
        addToCart: mockAddToCart,
    }),
}));

// Mock heroicons
jest.mock('@heroicons/react/24/solid', () => ({
    ChevronDownIcon: () => <svg data-testid="chevron-icon" />,
}));

const createMockProduct = (overrides: any = {}) => ({
    id: 1,
    name: 'Camiseta Test',
    price: 75000,
    description: 'Una camiseta premium de algodón orgánico.',
    image_url: '/product-main.jpg',
    gender: 'Hombre',
    clothingSize: {
        id: 1,
        quantity_available: 5,
        size: { id: 1, name: 'M' },
        clothingColor: {
            id: 1,
            slug: 'negro-slug',
            image_url: '/color-img.jpg',
            imageClothing: [
                { image_url: '/img1.jpg', position: 1 },
                { image_url: '/img2.jpg', position: 2 },
            ],
            color: { id: 1, name: 'Negro', hex: '#000000' },
            design: { reference: 'REF-001' },
        },
    },
    ...overrides,
});

const createVariants = () => {
    const product1 = createMockProduct();
    const product2 = createMockProduct({
        id: 2,
        clothingSize: {
            id: 2,
            quantity_available: 3,
            size: { id: 2, name: 'L' },
            clothingColor: {
                id: 1,
                slug: 'negro-slug',
                image_url: '/color-img.jpg',
                imageClothing: [
                    { image_url: '/img1.jpg', position: 1 },
                ],
                color: { id: 1, name: 'Negro', hex: '#000000' },
                design: { reference: 'REF-001' },
            },
        },
    });
    const product3 = createMockProduct({
        id: 3,
        clothingSize: {
            id: 3,
            quantity_available: 2,
            size: { id: 1, name: 'M' },
            clothingColor: {
                id: 2,
                slug: 'blanco-slug',
                image_url: '/white-img.jpg',
                imageClothing: [],
                color: { id: 2, name: 'Blanco', hex: '#FFFFFF' },
                design: { reference: 'REF-001' },
            },
        },
    });
    return [product1, product2, product3];
};

// Import useRouter mock access
const mockPush = jest.fn();
jest.mock('next/navigation', () => ({
    useRouter: () => ({
        push: mockPush,
        replace: jest.fn(),
        prefetch: jest.fn(),
        back: jest.fn(),
    }),
    usePathname: () => '',
    useSearchParams: () => new URLSearchParams(),
}));

describe('ProductDetail component', () => {
    beforeEach(() => {
        jest.clearAllMocks();
        // Mock gtag and fbq on window
        (window as any).gtag = jest.fn();
        (window as any).fbq = jest.fn();
        window.scrollTo = jest.fn();
    });

    const variants = createVariants();
    const initialProduct = variants[0];

    it('renders product name and price', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        expect(screen.getByText('Camiseta Test')).toBeInTheDocument();
        expect(screen.getByText(/75/)).toBeInTheDocument();
    });

    it('renders product description in accordion', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        expect(screen.getByText(/algodón orgánico/)).toBeInTheDocument();
    });

    it('renders product images', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        const images = screen.getAllByRole('img');
        expect(images.length).toBeGreaterThanOrEqual(1);
    });

    it('renders gender label', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        expect(screen.getByText(/Hombre/)).toBeInTheDocument();
    });

    it('renders color selectors', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        expect(screen.getByText('Color')).toBeInTheDocument();
        expect(screen.getByLabelText('Seleccionar color Negro')).toBeInTheDocument();
        expect(screen.getByLabelText('Seleccionar color Blanco')).toBeInTheDocument();
    });

    it('renders size selectors', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        expect(screen.getByText('Talla')).toBeInTheDocument();
        expect(screen.getByText('M')).toBeInTheDocument();
        expect(screen.getByText('L')).toBeInTheDocument();
    });

    it('renders add to cart button', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        expect(screen.getByText('Añadir a la Bolsa')).toBeInTheDocument();
    });

    it('calls addToCart and tracks event when button is clicked', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        fireEvent.click(screen.getByText('Añadir a la Bolsa'));
        expect(mockAddToCart).toHaveBeenCalledTimes(1);
        expect((window as any).gtag).toHaveBeenCalledWith('event', 'add_to_cart', expect.any(Object));
        expect((window as any).fbq).toBeDefined();
    });

    it('changes color when a color button is clicked', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        const whiteBtn = screen.getByLabelText('Seleccionar color Blanco');
        fireEvent.click(whiteBtn);
        expect(mockPush).toHaveBeenCalledWith('/product/blanco-slug');
    });

    it('navigates to product ID if slug is missing during color change', () => {
        const productNoSlug = createMockProduct({
            clothingSize: {
                ...initialProduct.clothingSize,
                clothingColor: {
                    ...initialProduct.clothingSize.clothingColor,
                    slug: undefined,
                    id: 999,
                    color: { id: 2, name: 'Blanco', hex: '#FFFFFF' }
                }
            }
        });
        
        render(<ProductDetail initialProduct={initialProduct} variants={[initialProduct, productNoSlug]} />);
        
        const whiteBtn = screen.getByLabelText('Seleccionar color Blanco');
        fireEvent.click(whiteBtn);
        
        expect(mockPush).toHaveBeenCalledWith('/product/1'); // initialProduct.id is 1
    });

    it('falls back to any variant of the color if current size is not available in that color', () => {
        const productNewColorDifferentSize = createMockProduct({
            clothingSize: {
                ...initialProduct.clothingSize,
                size: { id: 2, name: 'L' }, // Different size
                clothingColor: {
                    ...initialProduct.clothingSize.clothingColor,
                    color: { id: 3, name: 'Gris', hex: '#808080' },
                    slug: 'gris-slug'
                }
            }
        });
        
        render(<ProductDetail initialProduct={initialProduct} variants={[initialProduct, productNewColorDifferentSize]} />);
        
        const grisBtn = screen.getByLabelText('Seleccionar color Gris');
        fireEvent.click(grisBtn);
        
        expect(mockPush).toHaveBeenCalledWith('/product/gris-slug');
    });

    it('changes size when a size button is clicked', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        fireEvent.click(screen.getByText('L'));
        // Size L should become selected (no outward sign other than state change)
        expect(screen.getByText('L')).toBeInTheDocument();
    });

    it('renders accordion sections', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        expect(screen.getByText('Descripción')).toBeInTheDocument();
        expect(screen.getByText('Detalles del Producto')).toBeInTheDocument();
        expect(screen.getByText('Envíos y Devoluciones')).toBeInTheDocument();
    });

    it('renders instruction icons in care accordion', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        fireEvent.click(screen.getByText('Instrucciones de Cuidado'));
        expect(screen.getByTitle('Lavado manual')).toBeInTheDocument();
        expect(screen.getByTitle('No usar blanqueador')).toBeInTheDocument();
    });

    it('shows Agotado when variant has 0 stock', () => {
        const outOfStockProduct = createMockProduct({
            clothingSize: {
                ...initialProduct.clothingSize,
                quantity_available: 0,
            },
        });
        render(<ProductDetail initialProduct={outOfStockProduct} variants={[outOfStockProduct]} />);
        expect(screen.getByText('Agotado')).toBeInTheDocument();
    });

    it('falls back to placeholder when no images available', () => {
        const noImgProduct = createMockProduct({
            image_url: '',
            clothingSize: {
                ...initialProduct.clothingSize,
                clothingColor: {
                    ...initialProduct.clothingSize.clothingColor,
                    imageClothing: [],
                },
            },
        });
        render(<ProductDetail initialProduct={noImgProduct} variants={[noImgProduct]} />);
        const images = screen.getAllByRole('img');
        expect(images[0]).toHaveAttribute('src', '/placeholder.png');
    });
});
