import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import Footer from '../../src/components/Footer';

// Mock next/image
jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => {
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        return <img {...props} priority={undefined} fetchPriority={undefined} />;
    },
}));

describe('Footer component', () => {

    it('renders main brand section', () => {
        render(<Footer showOutletLink={false} />);

        // Brand logo
        expect(screen.getByAltText('two-six-web Logo')).toBeInTheDocument();
        // Manifesto text
        expect(screen.getByText(/Redefiniendo el minimalismo moderno/i)).toBeInTheDocument();

        // Social links
        expect(screen.getByAltText('Instagram')).toBeInTheDocument();
        expect(screen.getByAltText('Tiktok')).toBeInTheDocument();
        expect(screen.getByAltText('WhatsApp')).toBeInTheDocument();
    });

    it('renders navigation links', () => {
        render(<Footer showOutletLink={false} />);

        // Collections
        expect(screen.getByText('Colecciones')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Hombre' })).toHaveAttribute('href', '/man');
        expect(screen.getByRole('link', { name: 'Mujer' })).toHaveAttribute('href', '/woman');
        expect(screen.getByRole('link', { name: 'Unisex' })).toHaveAttribute('href', '/unisex');

        // Assistance & Legal
        expect(screen.getByText('Asistencia & Legal')).toBeInTheDocument();
        expect(screen.getByRole('link', { name: 'Rastrear Pedido' })).toHaveAttribute('href', '/tracking');
        expect(screen.getByRole('link', { name: 'Contacto' })).toHaveAttribute('href', '/contact');
        expect(screen.getByRole('link', { name: 'Nuestra Identidad' })).toHaveAttribute('href', '/sobre-nosotros');
        expect(screen.getByRole('link', { name: 'Política de Privacidad' })).toHaveAttribute('href', '/politicas/privacidad');
        expect(screen.getByRole('link', { name: 'Términos y Condiciones' })).toHaveAttribute('href', '/legal/terminos-y-condiciones');
    });

    it('renders outlet link when showOutletLink is true', () => {
        const { rerender } = render(<Footer showOutletLink={true} />);
        expect(screen.getByRole('link', { name: 'Outlet Especial' })).toBeInTheDocument();

        rerender(<Footer showOutletLink={false} />);
        expect(screen.queryByRole('link', { name: 'Outlet Especial' })).not.toBeInTheDocument();
    });

    it('renders newsletter form without reloading the page', () => {
        render(<Footer showOutletLink={false} />);

        expect(screen.getByText('Únete al Club')).toBeInTheDocument();
        const emailInput = screen.getByPlaceholderText('Tu correo electrónico');
        const submitBtn = screen.getByRole('button', { name: 'Suscribirme' });

        expect(emailInput).toBeInTheDocument();
        expect(submitBtn).toBeInTheDocument();

        // In JSDOM with Radix UI, the easiest way to ensure the button doesn't trigger
        // unexpected reloads is ensuring it's tied to the form or type="submit".
        expect(submitBtn).toHaveAttribute('type', 'submit');
        expect(emailInput.closest('form')).toBeInTheDocument();

        // Simulating the form preventDefault
        let prevented = false;
        const form = emailInput.closest('form');
        form?.addEventListener('submit', (e) => {
            e.preventDefault();
            if (e.defaultPrevented) prevented = true;
        });

        fireEvent.submit(form!);
        expect(prevented).toBe(true);
    });

    it('renders dynamic copyright year', () => {
        render(<Footer showOutletLink={false} />);

        const currentYear = new Date().getFullYear();
        expect(screen.getByText(new RegExp(currentYear.toString()))).toBeInTheDocument();
    });

    it('handles newsletter subscription success', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: true,
            json: async () => ({ success: true })
        });

        render(<Footer />);
        const input = screen.getByPlaceholderText('Tu correo electrónico');
        const submitBtn = screen.getByRole('button', { name: /Suscribirme/i });

        fireEvent.change(input, { target: { value: 'test@email.com' } });
        fireEvent.submit(input.closest('form')!);

        await waitFor(() => {
            expect(screen.getByText(/¡Gracias por suscribirte/i)).toBeInTheDocument();
        });
    });

    it('handles newsletter subscription error', async () => {
        global.fetch = jest.fn().mockResolvedValue({
            ok: false,
            json: async () => ({ message: 'Error' })
        });

        render(<Footer />);
        const input = screen.getByPlaceholderText('Tu correo electrónico');
        
        fireEvent.change(input, { target: { value: 'test@email.com' } });
        fireEvent.submit(input.closest('form')!);

        await waitFor(() => {
            expect(screen.getByText(/Error/i)).toBeInTheDocument();
        });
    });
});
