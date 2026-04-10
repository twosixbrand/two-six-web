import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import PqrPage from '../../src/app/pqr/page';
import GuiaTallasCamisetasPage from '../../src/app/guia-tallas-camisetas/page';
import PrivacidadPage from '../../src/app/politicas/privacidad/page';
import EnviosPage from '../../src/app/politicas/envios-y-entregas/page';
import CambiosPage from '../../src/app/politicas/cambios-y-retracto/page';
import CookiesPage from '../../src/app/politicas/cookies/page';
import TerminosPage from '../../src/app/legal/terminos-y-condiciones/page';

// Mock sizeGuideApi
jest.mock('../../src/services/sizeGuideApi', () => ({
    getSizeGuides: jest.fn().mockResolvedValue([
        { size: 'M', width: '54', length: '72' }
    ])
}));

// Mock next/navigation
jest.mock('next/navigation', () => ({
    useRouter: () => ({ push: jest.fn() }),
    usePathname: () => '',
    useSearchParams: () => new URLSearchParams(),
}));

describe('Support and Legal Pages', () => {

    describe('PqrPage', () => {
        beforeEach(() => {
            global.fetch = jest.fn();
            localStorage.clear();
        });

        it('renders the PQR form', () => {
            render(<PqrPage />);
            expect(screen.getByText('Radicar PQR')).toBeInTheDocument();
            expect(screen.getByLabelText(/Nombre Completo/i)).toBeInTheDocument();
        });

        it('shows error if privacy not accepted', async () => {
            render(<PqrPage />);
            const submitBtn = screen.getByRole('button', { name: /Generar Radicado/i });
            
            // Should be disabled by default if checkbox not checked
            expect(submitBtn).toBeDisabled();
        });

        it('submits successfully and shows success message', async () => {
            (global.fetch as jest.Mock).mockResolvedValueOnce({
                ok: true,
                json: async () => ({ radicado: 'PQR-123' })
            });

            render(<PqrPage />);
            
            fireEvent.change(screen.getByLabelText(/Nombre Completo/i), { target: { value: 'Test User' } });
            fireEvent.change(screen.getByLabelText(/Cédula/i), { target: { value: '12345' } });
            fireEvent.change(screen.getByLabelText(/Correo Electrónico/i), { target: { value: 'test@user.com' } });
            fireEvent.change(screen.getByLabelText(/Descripción/i), { target: { value: 'Mi reclamo' } });
            
            const checkbox = screen.getByLabelText(/Acepto la Política de Privacidad/i);
            fireEvent.click(checkbox);

            const submitBtn = screen.getByRole('button', { name: /Generar Radicado/i });
            fireEvent.click(submitBtn);

            await waitFor(() => {
                expect(screen.getByText('Solicitud Recibida')).toBeInTheDocument();
                expect(screen.getByText(/PQR-123/)).toBeInTheDocument();
            });
        });
    });

    describe('GuiaTallasCamisetasPage', () => {
        it('renders and loads sizes', async () => {
            render(<GuiaTallasCamisetasPage />);
            expect(screen.getByText('Guía de Tallas')).toBeInTheDocument();
            
            await waitFor(() => {
                expect(screen.getByText('M')).toBeInTheDocument();
                expect(screen.getByText('54 cm')).toBeInTheDocument();
            });
        });
    });

    describe('Legal and Policy Pages', () => {
        it('renders PrivacidadPage', () => {
            render(<PrivacidadPage />);
            expect(screen.getByText(/Política de Tratamiento/i)).toBeInTheDocument();
        });

        it('renders EnviosPage', () => {
            render(<EnviosPage />);
            expect(screen.getByText(/Política de Compras/i)).toBeInTheDocument();
        });

        it('renders CambiosPage', () => {
            render(<CambiosPage />);
            const headings = screen.getAllByText(/Política de Cambios/i);
            expect(headings[0]).toBeInTheDocument();
        });

        it('renders CookiesPage', () => {
            render(<CookiesPage />);
            const headings = screen.getAllByText(/Política de Cookies/i);
            expect(headings[0]).toBeInTheDocument();
        });

        it('renders TerminosPage', () => {
            render(<TerminosPage />);
            const headings = screen.getAllByText(/Términos y Condiciones/i);
            expect(headings[0]).toBeInTheDocument();
        });
    });
});
