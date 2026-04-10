import React from 'react';
import { render, screen } from '@testing-library/react';
import BlogIndexPage from '../../src/app/blog/page';

// Mock lib/blog
jest.mock('../../src/lib/blog', () => ({
    getAllPosts: jest.fn().mockResolvedValue([
        {
            slug: 'post-1',
            title: 'Test Post 1',
            excerpt: 'Excerpt 1',
            date: '2026-04-01',
            tags: ['Moda'],
            coverImage: '/img1.jpg'
        }
    ])
}));

describe('BlogIndexPage', () => {
    it('renders the blog index page with posts', async () => {
        const ResolvedPage = await BlogIndexPage();
        render(ResolvedPage);

        expect(screen.getByText('Two Six Journal (Blog)')).toBeInTheDocument();
        expect(screen.getByText('Test Post 1')).toBeInTheDocument();
        expect(screen.getByText('Excerpt 1')).toBeInTheDocument();
    });
});
