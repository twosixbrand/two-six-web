import React from 'react';
import { render, screen, fireEvent, waitFor } from '@testing-library/react';
import CheckoutForm from '../../src/components/CheckoutForm';
import { useCart } from '../../src/context/CartContext';
import { useWompiPayment } from '../../src/hooks/useWompiPayment';
import { getDepartments, getCities } from '../../src/services/locationApi';
import { useRouter } from 'next/navigation';
import userEvent from '@testing-library/user-event';

// --- Mocks ---
jest.mock('next/navigation', () => ({
    useRouter: jest.fn(),
}));

jest.mock('next/link', () => ({
    __esModule: true,
    default: ({ children, href, ...rest }: any) => <a href={href} {...rest}>{children}</a>,
}));

jest.mock('../../src/context/CartContext', () => ({
    useCart: jest.fn(),
}));

jest.mock('../../src/hooks/useWompiPayment', () => ({
    useWompiPayment: jest.fn(),
}));

jest.mock('../../src/services/locationApi', () => ({
    getDepartments: jest.fn(),
    getCities: jest.fn(),
}));

// Mock the shadcn Label component
jest.mock('@/components/ui/label', () => ({
    Label: ({ children, ...props }: any) => <label {...props}>{children}</label>,
}));

// --- Global Setup ---
const mockPush = jest.fn();
const mockStartPaymentFlow = jest.fn();

const mockDepartments = [
    { id: 1, name: 'Antioquia' },
    { id: 2, name: 'Cundinamarca' }
];

const mockCities = [
    { id: 10, name: 'Medellin', departmentId: 1, shipping_cost: 15000 },
    { id: 11, name: 'Bello', departmentId: 1, shipping_cost: 12000 }
];

const mockCartData = {
    cartItems: [
        {
            id: 'prod-1',
            quantity: 2,
            price: 50000,
            name: 'Camiseta Test',
            clothingSize: {
                size: { name: 'M' },
                clothingColor: {
                    color: { name: 'Rojo' },
                    image_url: 'http://test.com/img.png'
                }
            }
        }
    ],
    cartTotal: 100000,
    itemCount: 2,
};

describe('CheckoutForm component', () => {

    beforeEach(() => {
        jest.clearAllMocks();

        (useRouter as jest.Mock).mockReturnValue({ push: mockPush });

        (useCart as jest.Mock).mockReturnValue(mockCartData);

        (useWompiPayment as jest.Mock).mockReturnValue({
            startPaymentFlow: mockStartPaymentFlow,
            loadingPayment: false
        });

        (getDepartments as jest.Mock).mockResolvedValue(mockDepartments);
        (getCities as jest.Mock).mockResolvedValue(mockCities);

        // Clear local storage manually before each test if someone polluted it
        window.localStorage.clear();
    });

    it('returns null if cart is empty', () => {
        (useCart as jest.Mock).mockReturnValue({ ...mockCartData, itemCount: 0 });
        const { container } = render(<CheckoutForm />);

        expect(container).toBeEmptyDOMElement();
    });

    it('renders form and loads departments on mount', async () => {
        render(<CheckoutForm />);

        // Title changed from "Datos de Envío" to "Datos de Contacto"
        expect(screen.getByText('Datos de Contacto')).toBeInTheDocument();
        expect(screen.getByLabelText('Nombre Completo')).toBeInTheDocument();

        // Wait for departments to load
        await waitFor(() => {
            expect(getDepartments).toHaveBeenCalledTimes(1);
        });

        const departmentSelect = screen.getByLabelText('Departamento');
        await waitFor(() => {
            expect(departmentSelect).toHaveTextContent('Antioquia');
        });
    });

    it('fetches cities when a department is selected and updates shipping costs', async () => {
        const user = userEvent.setup();
        render(<CheckoutForm />);

        // Wait for the department options to be populated properly
        await waitFor(() => {
            expect(getDepartments).toHaveBeenCalledTimes(1);
        }, { timeout: 3000 });

        const deptSelect = await screen.findByLabelText('Departamento');

        // Ensure options actually exist
        await waitFor(() => {
            const options = Array.from(deptSelect.querySelectorAll('option'));
            expect(options.some(opt => opt.value === '1')).toBe(true);
        });

        await user.selectOptions(deptSelect, '1'); // Select Antioquia

        await waitFor(() => {
            expect(getCities).toHaveBeenCalledWith(1);
        });

        const citySelect = await screen.findByLabelText('Ciudad / Municipio');

        await waitFor(() => {
            const options = Array.from(citySelect.querySelectorAll('option'));
            expect(options.some(opt => opt.value === '10')).toBe(true);
        });

        await user.selectOptions(citySelect, '10'); // Select Medellin

        // Medellin has shipping cost of 15000. cartTotal is 100000. Total = 115000.
        await waitFor(() => {
            expect(screen.getByText('$115,000')).toBeInTheDocument();
        });
    });

    it('handles form submission successfully via startPaymentFlow', async () => {
        const user = userEvent.setup();
        render(<CheckoutForm />);

        // Wait for inputs to be ready
        await waitFor(() => expect(screen.getByLabelText('Nombre Completo')).toBeInTheDocument());

        const nameInput = screen.getByLabelText('Nombre Completo');
        const emailInput = screen.getByLabelText('Correo Electrónico');
        const phoneInput = screen.getByLabelText('Teléfono');
        const addressInput = screen.getByLabelText('Dirección de Envío');

        await user.type(nameInput, 'John Doe');
        await user.type(emailInput, 'john@example.com');
        await user.type(phoneInput, '3001234567');
        await user.type(addressInput, 'Calle 123');

        const deptSelect = screen.getByLabelText('Departamento');
        await user.selectOptions(deptSelect, '1');

        await waitFor(() => expect(getCities).toHaveBeenCalledWith(1));
        const citySelect = screen.getByLabelText('Ciudad / Municipio');

        await waitFor(() => expect(citySelect).not.toBeDisabled());
        await user.selectOptions(citySelect, '10'); // Medellin

        // Accept terms checkbox (required for form submission)
        const termsCheckbox = screen.getByLabelText(/He leído y acepto/i);
        fireEvent.click(termsCheckbox);

        const form = screen.getByRole('button', { name: 'Realizar Pago' }).closest('form');

        // Trigger submit
        fireEvent.submit(form!);

        await waitFor(() => {
            expect(mockStartPaymentFlow).toHaveBeenCalledTimes(1);
        });

        const paymentDataArg = mockStartPaymentFlow.mock.calls[0][0];

        expect(paymentDataArg.customer.name).toBe('John Doe');
        expect(paymentDataArg.shippingCost).toBe(15000);
        expect(paymentDataArg.total).toBe(115000);
        expect(paymentDataArg.items).toHaveLength(1);
        expect(paymentDataArg.items[0].productName).toBe('Camiseta Test');
    });

    it('autopopulates with profile info if user is logged in (via localStorage)', async () => {
        // Prepare mock localStorage
        const mockCustomer = {
            id: 99,
            name: 'Jane Smith',
            email: 'jane@smith.com',
            current_phone_number: '123456789',
            shipping_address: 'Ave Test 456',
            state: 'Antioquia',
            city: 'Medellin'
        };

        window.localStorage.setItem('customerData', JSON.stringify(mockCustomer));

        global.fetch = jest.fn((url: string) => {
            if (url.includes('/api/customer/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve(mockCustomer),
                });
            }
            if (url.includes('/api/address/')) {
                return Promise.resolve({
                    ok: true,
                    json: () => Promise.resolve([]),
                });
            }
            return Promise.resolve({ ok: false });
        }) as jest.Mock;

        render(<CheckoutForm />);

        await waitFor(() => {
            const nameInput = screen.getByLabelText('Nombre Completo') as HTMLInputElement;
            expect(nameInput.value).toBe('Jane Smith');
        });

        const emailInput = screen.getByLabelText('Correo Electrónico') as HTMLInputElement;
        expect(emailInput.value).toBe('jane@smith.com');
    });
});
