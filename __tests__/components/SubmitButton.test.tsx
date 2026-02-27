import React from 'react';
import { render, screen } from '@testing-library/react';
import { SubmitButton } from '../../src/components/SubmitButton';

// Mock useFormStatus
const mockUseFormStatus = jest.fn();
jest.mock('react-dom', () => ({
    ...jest.requireActual('react-dom'),
    useFormStatus: () => mockUseFormStatus(),
}));

describe('SubmitButton component', () => {
    it('renders button with provided text when not pending', () => {
        mockUseFormStatus.mockReturnValue({ pending: false });
        render(<SubmitButton text="Enviar" pendingText="Enviando..." />);
        expect(screen.getByRole('button')).toHaveTextContent('Enviar');
    });

    it('renders pending text when form is submitting', () => {
        mockUseFormStatus.mockReturnValue({ pending: true });
        render(<SubmitButton text="Enviar" pendingText="Enviando..." />);
        expect(screen.getByRole('button')).toHaveTextContent('Enviando...');
    });

    it('is a submit button', () => {
        mockUseFormStatus.mockReturnValue({ pending: false });
        render(<SubmitButton text="Enviar" pendingText="Enviando..." />);
        expect(screen.getByRole('button')).toHaveAttribute('type', 'submit');
    });
});
