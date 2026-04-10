import React from 'react';
import { render, screen, waitFor } from '@testing-library/react';
import BlogPost from '../../src/app/blog/[slug]/page';
import UnsubscribePage from '../../src/app/unsubscribe/page';
import MaintenancePage from '../../src/app/mantenimiento/page';

// Mock lib/blog
jest.mock('../../src/lib/blog', () => ({
    getPostBySlug: jest.fn().mockResolvedValue({
        title: 'Test Post',
        excerpt: 'Test Excerpt',
        date: '2026-04-01',
        coverImage: '/test.jpg',
        tags: ['Test'],
        contentHtml: '<p>Test Content</p>'
    }),
    getPostSlugs: jest.fn().mockReturnValue(['post-1'])
}));

// Mock next/navigation
const mockSearchParams = new URLSearchParams();
jest.mock('next/navigation', () => ({
    notFound: jest.fn(),
    useSearchParams: () => mockSearchParams,
}));

describe('Utility Pages', () => {

    describe('BlogPost', () => {
        it('renders the blog post correctly', async () => {
            const ResolvedPage = await BlogPost({ params: Promise.resolve({ slug: 'test-post' }) });
            render(ResolvedPage);

            const titles = screen.getAllByText('Test Post');
            expect(titles[0]).toBeInTheDocument();
            expect(screen.getByText('Por Two Six')).toBeInTheDocument();
            expect(screen.getByText('Test Content')).toBeInTheDocument();
        });
    });

    describe('UnsubscribePage', () => {
        it('shows success message when status is success', () => {
            mockSearchParams.set('status', 'success');
            render(<UnsubscribePage />);
            expect(screen.getByText('¡Te has dado de baja!')).toBeInTheDocument();
        });

        it('shows error message when status is not success', () => {
            mockSearchParams.set('status', 'error');
            render(<UnsubscribePage />);
            expect(screen.getByText('Algo salió mal')).toBeInTheDocument();
        });
    });

    describe('MaintenancePage', () => {
        it('renders maintenance message', () => {
            render(<MaintenancePage />);
            expect(screen.getByText(/Elevando la/i)).toBeInTheDocument();
            expect(screen.getByText(/proceso de actualización/i)).toBeInTheDocument();
        });
    });
});
