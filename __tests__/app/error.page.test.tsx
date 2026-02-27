import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import GlobalError from '../../src/app/error';

jest.mock('@/lib/actions/error', () => ({
    logError: jest.fn(),
}));

describe('GlobalError page', () => {
    const mockReset = jest.fn();
    const mockError = new Error('Test error message');

    it('renders the error message heading', () => {
        render(<GlobalError error={mockError} reset={mockReset} />);
        expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
    });

    it('renders the explanation text', () => {
        render(<GlobalError error={mockError} reset={mockReset} />);
        expect(screen.getByText(/error inesperado/)).toBeInTheDocument();
    });

    it('calls reset when retry button is clicked', () => {
        render(<GlobalError error={mockError} reset={mockReset} />);
        fireEvent.click(screen.getByText('Intentar de nuevo'));
        expect(mockReset).toHaveBeenCalledTimes(1);
    });
});
