import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import TrackingButton from './TrackingButton';
import { useRouter } from 'next/navigation';

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

describe('TrackingButton', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    
    // Mock dataLayer
    (window as any).dataLayer = [];
  });

  it('pushes event to dataLayer and navigates on click', () => {
    render(<TrackingButton text="COMPRAR" />);
    
    const button = screen.getByRole('button', { name: /COMPRAR/i });
    fireEvent.click(button);

    expect((window as any).dataLayer).toContainEqual({ event: 'begin_checkout' });
    expect(pushMock).toHaveBeenCalledWith('/catalog?tag=nuevo-drop');
  });

  it('navigates even if dataLayer is missing', () => {
    delete (window as any).dataLayer;
    
    render(<TrackingButton text="COMPRAR" />);
    
    const button = screen.getByRole('button', { name: /COMPRAR/i });
    fireEvent.click(button);

    expect(pushMock).toHaveBeenCalledWith('/catalog?tag=nuevo-drop');
  });
});
