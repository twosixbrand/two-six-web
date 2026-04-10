import React from 'react';
import { render, screen } from '@testing-library/react';
import SobreNosotrosPage from '../../src/app/sobre-nosotros/page';

describe('SobreNosotrosPage', () => {
    it('renders the about us page with identity sections', () => {
        render(<SobreNosotrosPage />);
        
        expect(screen.getByText('Nuestra Identidad')).toBeInTheDocument();
        expect(screen.getByText(/Hecho en Medellín/i)).toBeInTheDocument();
        expect(screen.getByText('Nuestra Promesa')).toBeInTheDocument();
        expect(screen.getByText('Explorar Colecciones')).toBeInTheDocument();
    });

    it('renders the logo', () => {
        render(<SobreNosotrosPage />);
        const logo = screen.getByAltText('Two Six Logo');
        expect(logo).toBeInTheDocument();
    });
});
