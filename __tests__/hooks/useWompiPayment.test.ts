import { renderHook, act } from '@testing-library/react';
import { useWompiPayment } from '@/hooks/useWompiPayment';

describe('useWompiPayment', () => {
    let mockOnSuccess: jest.Mock;
    let mockOnError: jest.Mock;
    let mockOnCancel: jest.Mock;

    beforeEach(() => {
        mockOnSuccess = jest.fn();
        mockOnError = jest.fn();
        mockOnCancel = jest.fn();

        // Mock fetch
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
        delete window.WidgetCheckout;
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
                orderData: { customer: { email: 'test@example.com', name: 'Test' } }
            } as any);
        });

        // The widget should have been called
        expect(window.WidgetCheckout).toHaveBeenCalledWith(expect.objectContaining({
            currency: 'COP',
            amountInCents: 50000,
            reference: 'ref_123',
            publicKey: 'pub_test_123',
            signature: { integrity: 'integrity_123' }
        }));
        
        // onSuccess should be called by the mock callback
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
            await result.current.startPaymentFlow({
                orderData: { customer: { email: 'test2@example.com', name: 'Test 2' } }
            } as any);
        });

        expect(window.WidgetCheckout).toHaveBeenCalledWith(expect.objectContaining({
            currency: 'COP',
            amountInCents: 60000,
            reference: 'ref_snake',
            publicKey: 'pub_test_snake',
            signature: { integrity: 'integrity_snake' }
        }));
    });

    it('should handle wompi object without integrity signature safely', async () => {
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
                        publicKey: 'pub_test_no_sig',
                        amountInCents: 10000,
                        currency: 'COP',
                        reference: 'ref_no_sig'
                    }
                }),
            })
        );

        await act(async () => {
            await result.current.startPaymentFlow({
                orderData: { customer: { email: 'test3@example.com' } }
            } as any);
        });

        const callArgs = (window.WidgetCheckout as jest.Mock).mock.calls[0][0];
        expect(callArgs.publicKey).toBe('pub_test_no_sig');
        expect(callArgs.signature).toBeUndefined();
    });
});
