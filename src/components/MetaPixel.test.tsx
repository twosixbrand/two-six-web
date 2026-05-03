import React from 'react';
import { render } from '@testing-library/react';
import MetaPixel from './MetaPixel';
import { usePathname, useSearchParams } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  usePathname: jest.fn(),
  useSearchParams: jest.fn(),
}));

// Mock next/script
jest.mock('next/script', () => ({
  __esModule: true,
  default: ({ onLoad }: any) => {
    // Simulate script loading
    React.useEffect(() => {
      if (onLoad) onLoad();
    }, [onLoad]);
    return <script data-testid="fb-script" />;
  },
}));

describe('MetaPixel', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    (usePathname as jest.Mock).mockReturnValue('/');
    (useSearchParams as jest.Mock).mockReturnValue(new URLSearchParams());
    
    // Mock fbq
    (window as any).fbq = jest.fn();
  });

  it('initializes and tracks PageView on load', () => {
    render(<MetaPixel />);
    
    expect((window as any).fbq).toHaveBeenCalledWith('track', 'PageView');
  });

  it('tracks PageView on route change', () => {
    const { rerender } = render(<MetaPixel />);
    
    // Change route
    (usePathname as jest.Mock).mockReturnValue('/new-page');
    rerender(<MetaPixel />);
    
    expect((window as any).fbq).toHaveBeenCalledTimes(2);
    expect((window as any).fbq).toHaveBeenLastCalledWith('track', 'PageView');
  });
});
