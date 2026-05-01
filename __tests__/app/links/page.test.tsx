import React from 'react';
import { render, screen } from '@testing-library/react';
import LinksPage from '../../../src/app/links/page';

describe('LinksPage', () => {
    it('renders the links page with official links', () => {
        render(<LinksPage />);
        
        expect(screen.getByText('Tienda Oficial')).toBeInTheDocument();
        expect(screen.getByText('WhatsApp Directo')).toBeInTheDocument();
        expect(screen.getByText('Facebook Oficial')).toBeInTheDocument();
        expect(screen.getByText('Rastrear Pedido')).toBeInTheDocument();
        expect(screen.getByText(/Two Six S.A.S./)).toBeInTheDocument();
    });

    it('renders the logo image', () => {
        render(<LinksPage />);
        const logo = screen.getByAltText('Two Six Logo');
        expect(logo).toBeInTheDocument();
        expect(logo).toHaveAttribute('src', '/logo.png');
    });
});
