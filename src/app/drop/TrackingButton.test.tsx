import { render, screen, fireEvent } from '@testing-library/react';
import TrackingButton from './TrackingButton';
import { useRouter } from 'next/navigation';

jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('TrackingButton', () => {
  const mockPush = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: mockPush });
    // Mock dataLayer
    (window as any).dataLayer = [];
  });

  it('renders with correct text and navigates on click', () => {
    render(<TrackingButton text="Rastrear" />);
    const button = screen.getByRole('button', { name: /Rastrear/i });
    expect(button).toBeInTheDocument();
    
    fireEvent.click(button);
    
    expect(mockPush).toHaveBeenCalledWith('/catalog?tag=nuevo-drop');
    expect((window as any).dataLayer).toContainEqual({ event: 'begin_checkout' });
  });

  it('applies custom classes', () => {
    const { container } = render(<TrackingButton text="Rastrear" className="custom-class" />);
    expect(container.firstChild).toHaveClass('custom-class');
  });
});
