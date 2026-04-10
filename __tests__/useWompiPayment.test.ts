import { renderHook, act, waitFor } from '@testing-library/react';
import { useWompiPayment } from '../src/hooks/useWompiPayment';

describe('useWompiPayment', () => {
    let mockOnSuccess: jest.Mock;
    let mockOnError: jest.Mock;
    let mockOnCancel: jest.Mock;
    let originalFetch: typeof global.fetch;
    let originalWidgetCheckout: any;

    beforeEach(() => {
        mockOnSuccess = jest.fn();
        mockOnError = jest.fn();
        mockOnCancel = jest.fn();

        // Mock fetch
        originalFetch = global.fetch;
        global.fetch = jest.fn();

        document.body.innerHTML = '';

        // Mock window properties
        originalWidgetCheckout = window.WidgetCheckout;
        window.WidgetCheckout = jest.fn().mockImplementation(() => ({
            open: jest.fn()
        })) as any;

        jest.clearAllMocks();
    });

    afterEach(() => {
        global.fetch = originalFetch;
        window.WidgetCheckout = originalWidgetCheckout;
    });

    it('injects Wompi script on mount', () => {
        // Temporarily remove WidgetCheckout so the hook injects the script
        const saved = window.WidgetCheckout;
        delete (window as any).WidgetCheckout;

        renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        const script = document.getElementById('wompi-script') as HTMLScriptElement;
        expect(script).toBeTruthy();
        expect(script?.src).toBe('https://checkout.wompi.co/widget.js');

        // Restore
        window.WidgetCheckout = saved;
    });

    it('does not inject script if it already exists', () => {
        const existingScript = document.createElement('script');
        existingScript.id = 'wompi-script';
        document.body.appendChild(existingScript);

        renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        const scripts = document.querySelectorAll('#wompi-script');
        expect(scripts.length).toBe(1); // Should only be the one we manually added
    });

    it('starts payment flow successfully', async () => {
        const mockResponseData = {
            wompi: {
                reference: 'REF-123',
                publicKey: 'pub_test_123',
                currency: 'COP',
                amountInCents: 10000,
                integritySignature: 'signature123'
            }
        };

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => mockResponseData
        });

        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        const mockCheckoutData = { test: 'data' };

        await act(async () => {
            await result.current.startPaymentFlow(mockCheckoutData);
        });

        expect(global.fetch).toHaveBeenCalledWith(
            expect.stringContaining('/api/order/checkout'),
            expect.objectContaining({
                method: 'POST',
                body: JSON.stringify(mockCheckoutData)
            })
        );
        expect(window.WidgetCheckout).toHaveBeenCalledWith(expect.objectContaining({
            reference: 'REF-123',
            amountInCents: 10000
        }));
    });

    it('handles api fetch error when starting payment', async () => {
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'API Error Message' })
        });

        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        expect(mockOnError).toHaveBeenCalledWith('API Error Message');
        expect(result.current.loadingPayment).toBe(false);
    });

    it('listens for escpressed message and calls onCancel', async () => {
        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        await act(async () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: { event: 'escpressed' }
            }));
        });

        expect(mockOnCancel).toHaveBeenCalled();
        expect(result.current.loadingPayment).toBe(false);
    });

    it('handles script loading error', async () => {
        const { result } = renderHook(() => useWompiPayment({
            onSuccess: jest.fn(),
            onError: jest.fn(),
            onCancel: jest.fn()
        }));
        
        const script = document.querySelector('script[src*="wompi"]');
        if (script) {
            fireEvent.error(script);
        }

        expect(result.current.loadingPayment).toBe(false);
    });
});
