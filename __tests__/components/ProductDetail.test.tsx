import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
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

    it('calls addToCart when button is clicked', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        fireEvent.click(screen.getByText('Añadir a la Bolsa'));
        expect(mockAddToCart).toHaveBeenCalledTimes(1);
    });

    it('changes color when a color button is clicked', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        const whiteBtn = screen.getByLabelText('Seleccionar color Blanco');
        fireEvent.click(whiteBtn);
        
        expect(mockPush).toHaveBeenCalledWith('/product/blanco-slug');
    });

    it('changes size when a size button is clicked', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        fireEvent.click(screen.getByText('L'));
        // Size L should become selected
    });

    it('renders accordion sections', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        expect(screen.getByText('Descripción')).toBeInTheDocument();
        expect(screen.getByText('Detalles del Producto')).toBeInTheDocument();
        expect(screen.getByText('Envíos y Devoluciones')).toBeInTheDocument();
    });

    it('renders reference number in details accordion', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        // Click the accordion trigger to expand "Detalles del Producto"
        fireEvent.click(screen.getByText('Detalles del Producto'));
        expect(screen.getByText(/REF-001/)).toBeInTheDocument();
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

    it('renders size guide button', () => {
        render(<ProductDetail initialProduct={initialProduct} variants={variants} />);
        expect(screen.getByText('Guía de tallas')).toBeInTheDocument();
    });
});
