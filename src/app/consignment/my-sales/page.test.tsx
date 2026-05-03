import React from 'react';
import { render, screen, fireEvent, waitFor, act } from '@testing-library/react';
import MySalesPage from './page';
import { useAuth } from '@/context/AuthContext';
import { useRouter } from 'next/navigation';

// Mock useAuth
jest.mock('@/context/AuthContext', () => ({
  useAuth: jest.fn(),
}));

// Mock useRouter
jest.mock('next/navigation', () => ({
  useRouter: jest.fn(),
}));

const mockStock = [
  {
    id: 1,
    name: 'Bodega Principal',
    stocks: [
      {
        id_clothing_size: 101,
        quantity: 10,
        unit_price: 50000,
        clothingSize: {
          size: { name: 'M' },
          product: { id: 1, price: 50000 },
          clothingColor: {
            color: { name: 'Rojo' },
            design: { reference: 'REF-001', description: 'Test Design' },
            imageClothing: [{ image_url: 'http://example.com/img.jpg' }]
          }
        }
      }
    ]
  }
];

const mockReports = [
  {
    id: 501,
    status: 'PENDING',
    createdAt: new Date().toISOString(),
    warehouse: { id: 1, name: 'Bodega Principal' },
    notes: 'Test report',
    items: [
      {
        id: 1,
        quantity: 2,
        clothingSize: {
          size: { name: 'M' },
          clothingColor: {
            color: { name: 'Rojo' },
            design: { reference: 'REF-001' }
          }
        }
      }
    ]
  }
];

const mockUnpaid = [
  {
    id: 901,
    order_reference: 'ORD-123',
    total_payment: 100000,
    createdAt: new Date().toISOString(),
    consignmentPayments: []
  }
];

const mockPayments = [
  {
    id: 801,
    amount: 50000,
    status: 'APPROVED',
    payment_method: 'TRANSFERENCIA',
    createdAt: new Date().toISOString(),
    order: { order_reference: 'ORD-123' }
  }
];

describe('MySalesPage', () => {
  const pushMock = jest.fn();

  beforeEach(() => {
    jest.clearAllMocks();
    (useRouter as jest.Mock).mockReturnValue({ push: pushMock });
    
    // Default auth state: Logged in as ally
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: true,
      isConsignmentAlly: true,
      userName: 'John Doe',
      loading: false,
    });

    global.fetch = jest.fn((url) => {
      if (url.includes('/my-stock')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockStock) });
      if (url.includes('/my-reports')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockReports) });
      if (url.includes('/my-unpaid')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockUnpaid) });
      if (url.includes('/my-payments')) return Promise.resolve({ ok: true, json: () => Promise.resolve(mockPayments) });
      if (url.includes('/sell-reports')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) });
      if (url.includes('/payments/upload')) return Promise.resolve({ ok: true, json: () => Promise.resolve({ id: 1 }) });
      return Promise.reject(new Error('Unknown URL'));
    }) as jest.Mock;

    // Mock localStorage
    Object.defineProperty(window, 'localStorage', {
      value: {
        getItem: jest.fn(() => 'mock-token'),
        setItem: jest.fn(),
        clear: jest.fn(),
      },
      writable: true,
    });
  });

  it('redirects to login if not authenticated', async () => {
    (useAuth as jest.Mock).mockReturnValue({
      isLoggedIn: false,
      isConsignmentAlly: false,
      loading: false,
    });

    render(<MySalesPage />);
    expect(pushMock).toHaveBeenCalledWith('/login');
  });

  it('renders loading state initially', () => {
    (useAuth as jest.Mock).mockReturnValue({ loading: true });
    render(<MySalesPage />);
    expect(screen.getByText(/Cargando/i)).toBeInTheDocument();
  });

  it('renders stock correctly after fetching', async () => {
    render(<MySalesPage />);
    
    await waitFor(() => {
      expect(screen.getByText('Bodega Principal')).toBeInTheDocument();
      expect(screen.getByText(/REF-001 — Rojo · M/)).toBeInTheDocument();
      expect(screen.getByText('10')).toBeInTheDocument(); // Quantity
    });
  });

  it('switches tabs correctly', async () => {
    render(<MySalesPage />);

    await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

    await waitFor(() => expect(screen.getByText('Bodega Principal')).toBeInTheDocument());

    const reportTab = screen.getByText(/Reportar Venta/i);
    fireEvent.click(reportTab);

    expect(screen.getByText(/^Bodega$/i)).toBeInTheDocument();
    expect(screen.queryByText(/Productos vendidos/i)).not.toBeInTheDocument();
  });

  it('submits a sale report successfully', async () => {
    render(<MySalesPage />);

    await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

    // Switch to report tab
    fireEvent.click(screen.getByText(/Reportar Venta/i));

    // Select warehouse
    const select = screen.getByRole('combobox');
    fireEvent.change(select, { target: { value: '1' } });

    // Add item from stock
    await waitFor(() => {
        const addItemBtns = screen.getAllByText(/REF-001 — Rojo · M/);
        fireEvent.click(addItemBtns[0]);
    });

    // Check item added
    expect(screen.getByText('Cantidades vendidas:')).toBeInTheDocument();
    
    // Enter notes
    const notesInput = screen.getByPlaceholderText(/Ej: Ventas de la semana/i);
    fireEvent.change(notesInput, { target: { value: 'Test sale' } });

    // Submit
    const submitBtn = screen.getByText(/Enviar reporte/i);
    fireEvent.click(submitBtn);

    // Component switches to history tab after success
    await waitFor(() => {
      expect(screen.getByText(/Mis Reportes/i)).toHaveClass('border-amber-500');
    });
  });

  it('submits a payment successfully', async () => {
    render(<MySalesPage />);

    await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

    // Switch to payments tab
    fireEvent.click(screen.getByText(/Mis Pagos/i));

    await waitFor(() => expect(screen.getByText('ORD-123')).toBeInTheDocument());

    // Click pay
    const payBtn = screen.getByRole('button', { name: /Pagar/i });
    fireEvent.click(payBtn);

    // Fill form
    expect(screen.getByText(/Registrar pago — Orden ORD-123/i)).toBeInTheDocument();
    
    const amountInput = screen.getByDisplayValue('100000');
    fireEvent.change(amountInput, { target: { value: '50000' } });

    // File upload
    const file = new File(['hello'], 'proof.png', { type: 'image/png' });
    const fileInput = document.querySelector('input[type="file"]') as HTMLInputElement;
    fireEvent.change(fileInput, { target: { files: [file] } });

    // Submit
    const submitBtn = screen.getByRole('button', { name: /Registrar pago/i });
    fireEvent.click(submitBtn);

    // Form resets after success
    await waitFor(() => {
      expect(screen.queryByText(/Registrar pago — Orden ORD-123/i)).not.toBeInTheDocument();
    });
  });

  it('displays history correctly', async () => {
    render(<MySalesPage />);

    await waitFor(() => expect(screen.queryByText(/Cargando/i)).not.toBeInTheDocument());

    // Switch to history tab
    fireEvent.click(screen.getByText(/Mis Reportes/i));

    await waitFor(() => {
      expect(screen.getByText('Bodega Principal')).toBeInTheDocument();
      expect(screen.getByText('Pendiente')).toBeInTheDocument();
      expect(screen.getByText(/Test report/i)).toBeInTheDocument();
    });
  });
});
