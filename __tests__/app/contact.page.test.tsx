import React from 'react';
import { render, screen } from '@testing-library/react';
import ContactPage from '../../src/app/contact/page';

jest.mock('@/components/Banner', () => ({
    __esModule: true,
    default: ({ title, subtitle }: any) => (
        <div data-testid="banner">
            <h1>{title}</h1>
            {subtitle && <p>{subtitle}</p>}
        </div>
    ),
}));

jest.mock('@/components/SubmitButton', () => ({
    SubmitButton: ({ text }: any) => <button type="submit">{text}</button>,
}));

// Mock the server action
jest.mock('../../src/app/contact/actions', () => ({
    sendContactEmail: jest.fn(),
}));

// Mock useActionState
jest.mock('react', () => ({
    ...jest.requireActual('react'),
    useActionState: jest.fn(() => [{ success: false, message: '' }, jest.fn()]),
}));

describe('ContactPage', () => {
    it('renders the banner with title Contacto', () => {
        render(<ContactPage />);
        expect(screen.getByText('Contacto')).toBeInTheDocument();
    });

    it('renders the contact form', () => {
        render(<ContactPage />);
        expect(screen.getByText('Ponte en contacto')).toBeInTheDocument();
    });

    it('renders form fields', () => {
        render(<ContactPage />);
        expect(screen.getByLabelText('Nombre Completo')).toBeInTheDocument();
        expect(screen.getByLabelText('Correo Electrónico')).toBeInTheDocument();
        expect(screen.getByLabelText('Mensaje')).toBeInTheDocument();
    });

    it('renders submit button', () => {
        render(<ContactPage />);
        expect(screen.getByText('Enviar Mensaje')).toBeInTheDocument();
    });

    it('renders contact info', () => {
        render(<ContactPage />);
        expect(screen.getByText('Medellín, Colombia')).toBeInTheDocument();
        expect(screen.getByText('twosixmarca@gmail.com')).toBeInTheDocument();
    });

    it('shows state message when present', () => {
        const useActionState = require('react').useActionState;
        useActionState.mockReturnValue([{ success: true, message: 'Enviado correctamente' }, jest.fn()]);
        render(<ContactPage />);
        expect(screen.getByText('Enviado correctamente')).toBeInTheDocument();
    });
});
