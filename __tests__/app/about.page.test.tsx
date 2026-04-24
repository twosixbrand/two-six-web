import React from 'react';
import { render, screen } from '@testing-library/react';
import SobreNosotrosPage from '../../src/app/sobre-nosotros/page';

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => <img {...props} fill={undefined} priority={undefined} />,
}));

jest.mock('@/components/Banner', () => ({
    __esModule: true,
    default: ({ title, subtitle }: any) => (
        <div data-testid="banner">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
        </div>
    ),
}));

describe('AboutPage', () => {
    it('renders the main heading', () => {
        render(<SobreNosotrosPage />);
        expect(screen.getByText('Nuestra Identidad')).toBeInTheDocument();
    });

    it('renders the local pride section', () => {
        render(<SobreNosotrosPage />);
        expect(screen.getByText('Orgullo Local: Hecho en Medellín')).toBeInTheDocument();
    });

    it('renders body text about the brand', () => {
        render(<SobreNosotrosPage />);
        expect(screen.getAllByText(/Two Six/).length).toBeGreaterThan(0);
    });
});
