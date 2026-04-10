import React from 'react';
import { render, screen, fireEvent, act } from '@testing-library/react';
import CookieConsent from '../../src/components/CookieConsent';
import PaginationControls from '../../src/components/PaginationControls';

// Mock next/navigation for Pagination
const mockPathname = '/test-path';
const mockSearchParams = new URLSearchParams('category=shirts');

jest.mock('next/navigation', () => ({
    usePathname: () => mockPathname,
    useSearchParams: () => mockSearchParams,
}));

describe('Global UI Components', () => {

    describe('CookieConsent', () => {
        beforeEach(() => {
            localStorage.clear();
            jest.useFakeTimers();
        });

        afterEach(() => {
            jest.useRealTimers();
        });

        it('shows the banner after a delay if not accepted', async () => {
            render(<CookieConsent />);
            
            // Should not show immediately
            expect(screen.queryByText(/Experiencia Two Six/i)).not.toBeInTheDocument();

            // Advance timers
            act(() => {
                jest.advanceTimersByTime(600);
            });

            expect(screen.getByText(/Experiencia Two Six/i)).toBeInTheDocument();
        });

        it('hides the banner and sets localStorage when accepted', () => {
            render(<CookieConsent />);
            
            act(() => {
                jest.advanceTimersByTime(600);
            });

            const acceptBtn = screen.getByRole('button', { name: /Aceptar y Continuar/i });
            fireEvent.click(acceptBtn);

            expect(screen.queryByText(/Experiencia Two Six/i)).not.toBeInTheDocument();
            expect(localStorage.getItem('twoSixCookieConsent')).toBe('true');
        });

        it('does not show if already accepted', () => {
            localStorage.setItem('twoSixCookieConsent', 'true');
            render(<CookieConsent />);
            
            act(() => {
                jest.advanceTimersByTime(600);
            });

            expect(screen.queryByText(/Experiencia Two Six/i)).not.toBeInTheDocument();
        });
    });

    describe('PaginationControls', () => {
        it('renders nothing if only one page', () => {
            const { container } = render(<PaginationControls currentPage={1} totalPages={1} />);
            expect(container).toBeEmptyDOMElement();
        });

        it('renders correct number of page links', () => {
            render(<PaginationControls currentPage={1} totalPages={3} />);
            expect(screen.getByText('1')).toBeInTheDocument();
            expect(screen.getByText('2')).toBeInTheDocument();
            expect(screen.getByText('3')).toBeInTheDocument();
        });

        it('disables previous button on first page', () => {
            render(<PaginationControls currentPage={1} totalPages={3} />);
            const prevBtn = screen.getByRole('link', { name: /Página anterior/i });
            expect(prevBtn).toHaveClass('pointer-events-none');
        });

        it('disables next button on last page', () => {
            render(<PaginationControls currentPage={3} totalPages={3} />);
            const nextBtn = screen.getByRole('link', { name: /Página siguiente/i });
            expect(nextBtn).toHaveClass('pointer-events-none');
        });

        it('generates correct URLs with existing search params', () => {
            render(<PaginationControls currentPage={1} totalPages={2} />);
            const page2Link = screen.getByRole('link', { name: /Ir a la página 2/i });
            expect(page2Link).toHaveAttribute('href', '/test-path?category=shirts&page=2');
        });
    });
});
