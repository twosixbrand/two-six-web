import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MySalesPage from '@/app/consignment/my-sales/page';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock next/navigation
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

// Mock useAuth
jest.mock('@/context/AuthContext', () => ({
  ...jest.requireActual('@/context/AuthContext'),
  useAuth: jest.fn(),
}));

// Mock fetch
global.fetch = jest.fn();

process.env.NEXT_PUBLIC_API_URL = 'http://localhost:3050';

describe('MySalesPage', () => {
  const mockRouter = { push: jest.fn() };
  const mockToken = 'test-token';

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue(mockRouter);
    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn().mockReturnValue(mockToken),
        setItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });

    // Default fetch mock to avoid "cannot read property ok of undefined"
    (global.fetch as jest.Mock).mockResolvedValue({
      ok: true,
      json: async () => ([]),
    });

    jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(() => {
    (console.error as jest.Mock).mockRestore();
  });

  const setupMockAuth = (overrides = {}) => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: true,
      isConsignmentAlly: true,
      userName: 'John Doe',
      loading: false,
      ...overrides,
    });
  };

  it('redirects to login if user is not authenticated', async () => {
    setupMockAuth({ isLoggedIn: false });
    render(<MySalesPage />);
    
    await waitFor(() => {
      expect(mockRouter.push).toHaveBeenCalledWith('/login');
    });
  });

  it('renders loading state initially', async () => {
    setupMockAuth({ loading: true });
    render(<MySalesPage />);
    expect(screen.getByText(/Cargando.../i)).toBeInTheDocument();
  });

  it('fetches and displays stock data', async () => {
    setupMockAuth();
    const mockWarehouses = [
      {
        id: 1,
        name: 'Bodega Central',
        stocks: [
          {
            id_clothing_size: 101,
            quantity: 5,
            clothingSize: {
              size: { name: 'M' },
              product: { price: 50000 },
              clothingColor: {
                color: { name: 'Negro' },
                design: { reference: 'REF001' },
              },
            },
          },
        ],
      },
    ];

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('my-stock')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWarehouses) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    await act(async () => {
      render(<MySalesPage />);
    });

    await waitFor(() => {
      expect(screen.getByText('Bodega Central')).toBeInTheDocument();
      expect(screen.getByText(/REF001 — Negro · M/i)).toBeInTheDocument();
      expect(screen.getByText('5')).toBeInTheDocument(); // Quantity
    });
  });

  it('switches between tabs', async () => {
    setupMockAuth();
    (global.fetch as jest.Mock).mockImplementation(() => 
      Promise.resolve({ ok: true, json: () => Promise.resolve([]) })
    );

    await act(async () => {
      render(<MySalesPage />);
    });

    const reportTab = screen.getByText('Reportar Venta');
    fireEvent.click(reportTab);
    expect(screen.getByText('Bodega')).toBeInTheDocument();

    const historyTab = screen.getByText(/Mis Reportes/i);
    fireEvent.click(historyTab);
    expect(screen.getByText(/No has enviado reportes aún/i)).toBeInTheDocument();
  });

  it('submits a sales report', async () => {
    setupMockAuth();
    const mockWarehouses = [
      {
        id: 1,
        name: 'Bodega Central',
        stocks: [
          {
            id_clothing_size: 101,
            quantity: 5,
            unit_price: 50000,
            clothingSize: {
              size: { name: 'M' },
              clothingColor: {
                color: { name: 'Negro' },
                design: { reference: 'REF001' },
              },
            },
          },
        ],
      },
    ];

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('my-stock')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockWarehouses) });
      if (url.includes('sell-reports') && !url.includes('my-reports')) {
        return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 123 }) });
      }
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    await act(async () => {
      render(<MySalesPage />);
    });

    // Go to report tab
    fireEvent.click(screen.getByText('Reportar Venta'));

    // Select warehouse
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    // Click product to add it
    await waitFor(() => {
      const productBtn = screen.getByText(/REF001 — Negro · M/i);
      fireEvent.click(productBtn);
    });

    // Submit report
    const submitBtn = screen.getByText(/Enviar reporte/i);
    fireEvent.click(submitBtn);

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/consignment/sell-reports'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });

  it('displays history of reports', async () => {
    setupMockAuth();
    const mockReports = [
      {
        id: 1,
        status: 'PENDING',
        createdAt: new Date().toISOString(),
        warehouse: { id: 1, name: 'Bodega Central' },
        items: [
          {
            id: 10,
            quantity: 2,
            clothingSize: {
              size: { name: 'M' },
              clothingColor: {
                color: { name: 'Negro' },
                design: { reference: 'REF001' },
              },
            },
          },
        ],
      },
    ];

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('my-reports')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockReports) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    await act(async () => {
      render(<MySalesPage />);
    });

    fireEvent.click(screen.getByText(/Mis Reportes/i));

    await waitFor(() => {
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
      expect(screen.getByText('Bodega Central')).toBeInTheDocument();
    });
  });

  it('submits a payment', async () => {
    setupMockAuth();
    const mockUnpaid = [
      {
        id: 1,
        order_reference: 'ORD-001',
        total_payment: 100000,
        consignmentPayments: [],
        createdAt: new Date().toISOString(),
      },
    ];

    (global.fetch as jest.Mock).mockImplementation((url) => {
      if (url.includes('my-unpaid')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUnpaid) });
      if (url.includes('payments/upload')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) });
      return Promise.resolve({ ok: true, json: () => Promise.resolve([]) });
    });

    await act(async () => {
      render(<MySalesPage />);
    });

    fireEvent.click(screen.getByText(/Mis Pagos/i));

    await waitFor(() => {
      expect(screen.getByText('ORD-001')).toBeInTheDocument();
    });

    // Click "Pagar"
    fireEvent.click(screen.getByText('Pagar'));

    // Fill form
    fireEvent.change(screen.getByLabelText(/Monto/i), { target: { value: '50000' } });
    
    // Select method
    fireEvent.change(screen.getByLabelText(/Medio de pago/i), { target: { value: 'TRANSFERENCIA' } });

    // Mock file upload
    const file = new File(['hello'], 'proof.png', { type: 'image/png' });
    const fileInput = screen.getByLabelText(/Comprobante/i);
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit
    fireEvent.click(screen.getByText('Registrar pago'));

    await waitFor(() => {
      expect(global.fetch).toHaveBeenCalledWith(
        expect.stringContaining('/api/consignment/payments/upload'),
        expect.objectContaining({ method: 'POST' })
      );
    });
  });
});
