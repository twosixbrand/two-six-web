import { renderHook, act } from '@testing-library/react';
import { useWompiPayment } from '@/hooks/useWompiPayment';

describe('useWompiPayment', () => {
    let mockOnSuccess: jest.Mock;
    let mockOnError: jest.Mock;
    let mockOnCancel: jest.Mock;

    let originalFetch: typeof global.fetch;

    beforeEach(() => {
        mockOnSuccess = jest.fn();
        mockOnError = jest.fn();
        mockOnCancel = jest.fn();

        // Mock fetch
        originalFetch = global.fetch;
        global.fetch = jest.fn().mockImplementation(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ 
                    reference: 'test-ref',
                    wompi: {
                        publicKey: 'pub_test_123',
                        amountInCents: 50000,
                        currency: 'COP',
                        integritySignature: 'integrity_123',
                        reference: 'ref_123'
                    }
                }),
            })
        ) as jest.Mock;

        // Mock window.WidgetCheckout
        window.WidgetCheckout = jest.fn().mockImplementation((config) => ({
            open: jest.fn((callback) => {
                // Simulate immediate callback for testing
                callback({
                    transaction: {
                        id: 'txn-123',
                        reference: config.reference,
                        status: 'APPROVED'
                    }
                });
            })
        }));
    });

    afterEach(() => {
        jest.clearAllMocks();
        global.fetch = originalFetch;
        delete window.WidgetCheckout;
        // Clean up scripts added during tests
        const script = document.getElementById("wompi-script");
        if (script) script.remove();
    });

    it('should initialize correctly and load script', () => {
        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));
        expect(result.current.loadingPayment).toBe(false);
        expect(typeof result.current.startPaymentFlow).toBe('function');
    });

    it('should handle wompi object with camelCase properties', async () => {
        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        await act(async () => {
            await result.current.startPaymentFlow({
                customer: { email: 'test@example.com', name: 'Test' }
            });
        });

        expect(window.WidgetCheckout).toHaveBeenCalledWith(expect.objectContaining({
            currency: 'COP',
            amountInCents: 50000,
            reference: 'ref_123',
            publicKey: 'pub_test_123',
            signature: { integrity: 'integrity_123' }
        }));
        
        expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
            status: 'APPROVED'
        }));
    });

    it('should handle wompi object with snake_case properties', async () => {
        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        (global.fetch as jest.Mock).mockImplementationOnce(() =>
            Promise.resolve({
                ok: true,
                json: () => Promise.resolve({ 
                    wompi: {
                        public_key: 'pub_test_snake',
                        amount_in_cents: 60000,
                        currency: 'COP',
                        integrity_signature: 'integrity_snake',
                        reference: 'ref_snake'
                    }
                }),
            })
        );

        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        expect(window.WidgetCheckout).toHaveBeenCalledWith(expect.objectContaining({
            currency: 'COP',
            amountInCents: 60000,
            reference: 'ref_snake',
            publicKey: 'pub_test_snake',
            signature: { integrity: 'integrity_snake' }
        }));
    });

    it('should handle API error (response not ok)', async () => {
        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            json: async () => ({ message: 'Invalid data' }),
        });

        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        expect(mockOnError).toHaveBeenCalledWith('Invalid data');
        expect(result.current.loadingPayment).toBe(false);
    });

    it('should handle missing wompi object in response', async () => {
        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ some: 'other data' }),
        });

        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        expect(mockOnError).toHaveBeenCalledWith('No se recibieron datos de Wompi del servidor.');
    });

    it('should handle timeout waiting for script', async () => {
        // Remove WidgetCheckout to trigger waitForScript
        const originalWidget = window.WidgetCheckout;
        delete (window as any).WidgetCheckout;

        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        // We use real timers but a shorter timeout in the hook?
        // No, the hook has 5000ms hardcoded.
        // I'll mock setTimeout for this test only.
        const originalSetTimeout = global.setTimeout;
        (global as any).setTimeout = (fn: any, ms: any) => originalSetTimeout(fn, 1);

        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        expect(mockOnError).toHaveBeenCalledWith(expect.stringContaining('La pasarela de pagos no está lista'));
        
        global.setTimeout = originalSetTimeout;
        window.WidgetCheckout = originalWidget;
    }, 10000); // Higher timeout for this test

    it('should handle DECLINED status from widget', async () => {
        window.WidgetCheckout = jest.fn().mockImplementation(() => ({
            open: jest.fn((callback) => {
                callback({ transaction: { id: 'txn-456', status: 'DECLINED' } });
            })
        }));

        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        expect(mockOnError).toHaveBeenCalledWith('La transacción fue rechazada por el banco.');
    });

    it('should handle widget-closed message and verify status', async () => {
        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        // Trigger startPaymentFlow to set transactionReference
        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        // Mock check-status call
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'APPROVED', transactionId: 'txn-789' }),
        });

        // Simulate message event from Wompi widget closing
        await act(async () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: { from: 'widget-checkout', type: 'widget-closed' }
            }));
        });

        expect(mockOnSuccess).toHaveBeenCalledWith(expect.objectContaining({
            id: 'txn-789',
            status: 'APPROVED'
        }));
    });

    it('should handle ESC pressed and call onCancel', async () => {
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
    });

    it('should handle invalid transaction result from widget', async () => {
        window.WidgetCheckout = jest.fn().mockImplementation(() => ({
            open: jest.fn((callback) => {
                // Missing status and id
                callback({ transaction: { reference: 'ref_123' } } as any);
            })
        }));

        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        expect(mockOnSuccess).not.toHaveBeenCalled();
        expect(mockOnError).not.toHaveBeenCalled();
    });

    it('should handle ERROR status from widget', async () => {
        window.WidgetCheckout = jest.fn().mockImplementation(() => ({
            open: jest.fn((callback) => {
                callback({ transaction: { id: 'txn-err', status: 'ERROR' } });
            })
        }));

        const { result } = renderHook(() => useWompiPayment({
            onSuccess: mockOnSuccess,
            onError: mockOnError,
            onCancel: mockOnCancel
        }));

        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        expect(mockOnError).toHaveBeenCalledWith('Ocurrió un error en la transacción.');
        expect(result.current.loadingPayment).toBe(false);
    });
});
