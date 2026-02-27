import React from 'react';
import { render, screen } from '@testing-library/react';
import AboutPage from '../../src/app/about/page';

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
    it('renders the banner with correct title', () => {
        render(<AboutPage />);
        expect(screen.getByText('Nosotros')).toBeInTheDocument();
    });

    it('renders the mission section', () => {
        render(<AboutPage />);
        expect(screen.getByText('Nuestra Misión')).toBeInTheDocument();
    });

    it('renders body text about the brand', () => {
        render(<AboutPage />);
        expect(screen.getAllByText(/Two Six Brand/).length).toBeGreaterThan(0);
    });
});
