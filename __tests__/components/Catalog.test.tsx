import React from 'react';
import { render, screen } from '@testing-library/react';
import Catalog from '../../src/components/Catalog';

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

    it('renders empty state message when no products', () => {
        render(<Catalog products={[]} />);
        // Catalog now shows an empty state with a message instead of an empty grid
        expect(screen.getByText('Estamos preparando nuevas prendas')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: /Ir Al Inicio/i })).toBeInTheDocument();
    });
});
