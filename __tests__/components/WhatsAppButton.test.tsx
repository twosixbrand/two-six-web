import React from 'react';
import { render, screen } from '@testing-library/react';
import WhatsAppButton from '../../src/components/WhatsAppButton';

describe('WhatsAppButton component', () => {
    it('renders the WhatsApp link', () => {
        render(<WhatsAppButton />);
        const link = screen.getByRole('link', { name: 'Contactar por WhatsApp' });
        expect(link).toBeInTheDocument();
        expect(link).toHaveAttribute('target', '_blank');
    });

    it('contains the correct WhatsApp URL', () => {
        render(<WhatsAppButton />);
        const link = screen.getByRole('link', { name: 'Contactar por WhatsApp' });
        expect(link.getAttribute('href')).toContain('wa.me/573108777629');
    });

    it('renders the WhatsApp icon image', () => {
        render(<WhatsAppButton />);
        const img = screen.getByAltText('WhatsApp');
        expect(img).toBeInTheDocument();
    });
});
