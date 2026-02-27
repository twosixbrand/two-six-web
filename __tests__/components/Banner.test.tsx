import React from 'react';
import { render, screen } from '@testing-library/react';
import Banner from '../../src/components/Banner';

jest.mock('next/image', () => ({
    __esModule: true,
    default: (props: any) => <img {...props} fill={undefined} priority={undefined} />,
}));

describe('Banner component', () => {
    it('renders with title', () => {
        render(<Banner imageUrl="/test.jpg" title="Test Title" />);
        expect(screen.getByText('Test Title')).toBeInTheDocument();
    });

    it('renders with subtitle when provided', () => {
        render(<Banner imageUrl="/test.jpg" title="Title" subtitle="Subtitle Text" />);
        expect(screen.getByText('Subtitle Text')).toBeInTheDocument();
    });

    it('does not render subtitle when not provided', () => {
        render(<Banner imageUrl="/test.jpg" title="Title" />);
        expect(screen.queryByText('Subtitle Text')).not.toBeInTheDocument();
    });

    it('renders the background image', () => {
        render(<Banner imageUrl="/banner-bg.jpg" title="Banner" />);
        const img = screen.getByAltText('Banner');
        expect(img).toBeInTheDocument();
        expect(img).toHaveAttribute('src', '/banner-bg.jpg');
    });
});
