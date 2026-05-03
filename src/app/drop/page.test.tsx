import React from 'react';
import { render, screen, fireEvent } from '@testing-library/react';
import DropLandingPage from './page';
import { getStoreDesigns } from '@/data/products';

// Mock getStoreDesigns
jest.mock('@/data/products', () => ({
  getStoreDesigns: jest.fn(),
}));

// Mock Next.js components

// Mock lucide-react
jest.mock('lucide-react', () => ({
  Truck: () => <div>Truck</div>,
  CreditCard: () => <div>CreditCard</div>,
  RefreshCcw: () => <div>RefreshCcw</div>,
  CheckCircle2: () => <div>CheckCircle2</div>,
}));

// Mock components
jest.mock('@/components/ProductCard', () => ({
  __esModule: true,
  default: ({ product }: any) => <div data-testid="product-card">{product.name}</div>,
}));

jest.mock('./TrackingButton', () => ({
  __esModule: true,
  default: ({ text }: any) => <button>{text}</button>,
}));

describe('DropLandingPage', () => {
  const mockProducts = [
    {
      id_product: 1,
      name: 'Camiseta Premium',
      image_url: 'http://example.com/img1.jpg',
      price: 80000,
    },
    {
      id_product: 2,
      name: 'Hoodie Streetwear',
      image_url: 'http://example.com/img2.jpg',
      price: 120000,
    }
  ];

  beforeEach(() => {
    jest.clearAllMocks();
    (getStoreDesigns as jest.Mock).mockResolvedValue({ data: mockProducts });
  });

  it('renders correctly with products', async () => {
    // Resolve the async component
    const Page = await DropLandingPage();
    render(Page);

    expect(screen.getByText(/Calidad que impone/i)).toBeInTheDocument();
    expect(screen.getByText(/Crafted for Real Ones/i)).toBeInTheDocument();
    expect(screen.getAllByTestId('product-card')).toHaveLength(2);
    expect(screen.getByText('Camiseta Premium')).toBeInTheDocument();
    expect(screen.getByText('Hoodie Streetwear')).toBeInTheDocument();
  });

  it('renders fallback image if no products are found', async () => {
    (getStoreDesigns as jest.Mock).mockResolvedValue({ data: [] });
    
    const Page = await DropLandingPage();
    render(Page);

    const heroImg = screen.getAllByRole('img')[0];
    expect(heroImg).toHaveAttribute('src', '/og-image.jpg');
    expect(screen.queryByTestId('product-card')).not.toBeInTheDocument();
  });
});
