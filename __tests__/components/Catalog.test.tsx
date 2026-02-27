import React from 'react';
import { render, screen } from '@testing-library/react';
import Catalog from '../../src/components/Catalog';

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => <img {...props} fill={undefined} />,
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('Catalog component', () => {
    const mockProducts = [
        { id_design: 1, id_product: 10, name: 'Camiseta Alpha', price: 50000, image_url: '/img1.jpg' },
        { id_design: 2, id_product: 20, name: 'Pantalón Beta', price: 80000, image_url: '/img2.jpg' },
    ];

    it('renders a ProductCard for each product', () => {
        render(<Catalog products={mockProducts as any} />);
        expect(screen.getByText('Camiseta Alpha')).toBeInTheDocument();
        expect(screen.getByText('Pantalón Beta')).toBeInTheDocument();
    });

    it('renders the correct number of product cards', () => {
        const { container } = render(<Catalog products={mockProducts as any} />);
        const links = container.querySelectorAll('a');
        expect(links.length).toBeGreaterThanOrEqual(2);
    });

    it('renders empty grid when no products', () => {
        const { container } = render(<Catalog products={[]} />);
        const grid = container.querySelector('.grid');
        expect(grid).toBeInTheDocument();
        expect(grid?.children.length).toBe(0);
    });
});
