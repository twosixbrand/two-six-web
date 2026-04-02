import React from 'react';
import { render, screen } from '@testing-library/react';
import HomePage from '../../src/app/page';

// 1. Mock Next Image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} priority={undefined} fetchPriority={undefined} fill={undefined} />;
    },
}));

// 2. Mock next/link
jest.mock('next/link', () => {
    return ({ children, href }: { children: React.ReactNode; href: string }) => (
        <a href={href}>{children}</a>
    );
});

// 3. Mock HeroCarousel so we don't need to mount Embla Carousel
jest.mock('../../src/components/HeroCarousel', () => ({
    HeroCarousel: () => <div data-testid="mock-hero-carousel">Hero Carousel Mock</div>
}));

// 4. Mock Catalog so we don't need to mount the whole product list
jest.mock('../../src/components/Catalog', () => ({
    __esModule: true,
    default: ({ products }: { products: any[] }) => (
        <div data-testid="mock-catalog">
            Catalog Mock with {products?.length || 0} items
        </div>
    )
}));

// 5. Mock getStoreDesigns data fetching - now returns paginated response
jest.mock('../../src/data/products', () => ({
    getStoreDesigns: jest.fn().mockResolvedValue({
        data: [
            { id: 1, name: 'Product 1' },
            { id: 2, name: 'Product 2' }
        ],
        meta: { total: 2, page: 1, totalPages: 1, limit: 12 }
    })
}));

describe('HomePage', () => {

    it('renders the HeroCarousel', async () => {
        const ResolvedPage = await HomePage();
        render(ResolvedPage);

        expect(screen.getByTestId('mock-hero-carousel')).toBeInTheDocument();
    });

    it('renders category banners with correct links', async () => {
        const ResolvedPage = await HomePage();
        render(ResolvedPage);

        expect(screen.getByText('Descubre tu Estilo')).toBeInTheDocument();

        // Check links
        const manLink = screen.getByRole('link', { name: /Hombre/i });
        expect(manLink).toHaveAttribute('href', '/man');

        const womanLink = screen.getByRole('link', { name: /Mujer/i });
        expect(womanLink).toHaveAttribute('href', '/woman');

        const unisexLink = screen.getByRole('link', { name: /Unisex/i });
        expect(unisexLink).toHaveAttribute('href', '/unisex');
    });

    it('renders Catalog component with fetched products', async () => {
        const ResolvedPage = await HomePage();
        render(ResolvedPage);

        expect(screen.getByText('Novedades')).toBeInTheDocument();

        const catalogMock = screen.getByTestId('mock-catalog');
        expect(catalogMock).toBeInTheDocument();
        expect(catalogMock).toHaveTextContent('Catalog Mock with 2 items');
    });

    it('renders the bottom "Ver Todo el Catálogo" link', async () => {
        const ResolvedPage = await HomePage();
        render(ResolvedPage);

        const allBtn = screen.getByRole('link', { name: /Ver Todo el Catálogo/i });
        expect(allBtn).toHaveAttribute('href', '/catalog');
    });
});
