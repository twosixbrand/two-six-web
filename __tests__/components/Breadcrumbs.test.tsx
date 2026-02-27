import React from 'react';
import { render, screen } from '@testing-library/react';
import Breadcrumbs from '../../src/components/Breadcrumbs';

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href }: any) => <a href={href}>{children}</a>,
}));

describe('Breadcrumbs component', () => {
    const items = [
        { label: 'Inicio', href: '/' },
        { label: 'Hombre', href: '/man' },
        { label: 'Producto X', href: '/product/1' },
    ];

    it('renders all breadcrumb labels', () => {
        render(<Breadcrumbs items={items} />);
        expect(screen.getByText('Inicio')).toBeInTheDocument();
        expect(screen.getByText('Hombre')).toBeInTheDocument();
        expect(screen.getByText('Producto X')).toBeInTheDocument();
    });

    it('renders links for all items except the last', () => {
        render(<Breadcrumbs items={items} />);
        const links = screen.getAllByRole('link');
        // The last item should be a <span>, not a link
        expect(links).toHaveLength(2);
        expect(links[0]).toHaveAttribute('href', '/');
        expect(links[1]).toHaveAttribute('href', '/man');
    });

    it('renders separators between items', () => {
        const { container } = render(<Breadcrumbs items={items} />);
        // There should be 2 separators for 3 items
        const separators = container.querySelectorAll('span.mx-2');
        expect(separators).toHaveLength(2);
    });

    it('renders accessible nav element', () => {
        render(<Breadcrumbs items={items} />);
        expect(screen.getByRole('navigation', { name: 'Breadcrumb' })).toBeInTheDocument();
    });
});
