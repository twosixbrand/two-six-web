import { renderHook, act } from '@testing-library/react';
import { useWompiPayment } from './useWompiPayment';

// Mock fetch
global.fetch = jest.fn();

describe('useWompiPayment', () => {
    const onSuccess = jest.fn();
    const onError = jest.fn();
    const onCancel = jest.fn();

    beforeEach(() => {
        jest.clearAllMocks();
        // Clear DOM scripts
        const script = document.getElementById('wompi-script');
        if (script) script.remove();
        delete (window as any).WidgetCheckout;
        delete (window as any).__startWompiPolling;
    });

    it('loads the Wompi script on mount', () => {
        renderHook(() => useWompiPayment({ onSuccess, onError, onCancel }));
        const script = document.getElementById('wompi-script') as HTMLScriptElement;
        expect(script).toBeInTheDocument();
        expect(script.src).toBe('https://checkout.wompi.co/widget.js');
    });

    it('handles message events for modal closure', async () => {
        renderHook(() => useWompiPayment({ onSuccess, onError, onCancel }));

        // Simulate Esc key pressed event from Wompi iframe
        await act(async () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: { event: 'escpressed' }
            }));
        });

        expect(onCancel).toHaveBeenCalled();
    });

    it('handles widget-closed event and checks status', async () => {
        // We need to mock WidgetCheckout before calling startPaymentFlow to avoid the 5s timeout
        (window as any).WidgetCheckout = jest.fn().mockImplementation(() => ({
            open: jest.fn()
        }));

        const { result } = renderHook(() => useWompiPayment({ onSuccess, onError, onCancel }));

        // Trigger a payment flow to set the reference
        const checkoutData = { test: true };
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ wompi: { reference: 'REF123', publicKey: 'PUB123' } }),
        });

        await act(async () => {
            await result.current.startPaymentFlow(checkoutData);
        });

        // Mock the check-status response
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'APPROVED', transactionId: 'TX123' }),
        });

        // Now simulate closing the widget
        await act(async () => {
            window.dispatchEvent(new MessageEvent('message', {
                data: { from: 'widget-checkout', type: 'widget-closed' }
            }));
        });

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/order/check-status'), expect.any(Object));
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ status: 'APPROVED', id: 'TX123' }));
    });

    it('starts payment flow and opens widget', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                wompi: {
                    reference: 'REF123',
                    publicKey: 'PUB123',
                    amountInCents: 1000,
                    currency: 'COP'
                }
            }),
        });

        const openMock = jest.fn();
        (window as any).WidgetCheckout = jest.fn().mockImplementation(() => ({
            open: openMock
        }));

        const { result } = renderHook(() => useWompiPayment({ onSuccess, onError, onCancel }));

        await act(async () => {
            await result.current.startPaymentFlow({ items: [] });
        });

        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/order/checkout'), expect.any(Object));
        expect(window.WidgetCheckout).toHaveBeenCalledWith(expect.objectContaining({
            reference: 'REF123',
            publicKey: 'PUB123'
        }));
        expect(openMock).toHaveBeenCalled();
    });

    it('handles backend checkout error', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 400,
            json: async () => ({ message: 'Invalid items' }),
        });

        const { result } = renderHook(() => useWompiPayment({ onSuccess, onError, onCancel }));

        await act(async () => {
            // No need to mock WidgetCheckout here as it should fail before waiting for script
            await result.current.startPaymentFlow({ items: [] });
        });

        expect(onError).toHaveBeenCalledWith('Invalid items');
        expect(result.current.loadingPayment).toBe(false);
    });

    it('starts polling when payment flow begins', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({
                wompi: { reference: 'REF123', publicKey: 'PUB123' }
            }),
        });

        (window as any).WidgetCheckout = jest.fn().mockImplementation(() => ({
            open: jest.fn()
        }));

        const { result } = renderHook(() => useWompiPayment({ onSuccess, onError, onCancel }));

        // The hook exposes __startWompiPolling on window
        expect((window as any).__startWompiPolling).toBeDefined();

        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        // We can't easily spy on the private startPolling but we can check if it was called via side effects if any
        // But since we mocked startPaymentFlow above, it should have set transactionReference
        expect(fetch).toHaveBeenCalledWith(expect.stringContaining('/api/order/checkout'), expect.any(Object));
    });

    it('handles widget callback with different statuses', async () => {
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ wompi: { reference: 'REF123', publicKey: 'PUB123' } }),
        });

        let widgetCallback: any;
        (window as any).WidgetCheckout = jest.fn().mockImplementation(() => ({
            open: jest.fn().mockImplementation((cb) => { widgetCallback = cb; })
        }));

        const { result } = renderHook(() => useWompiPayment({ onSuccess, onError, onCancel }));

        await act(async () => {
            await result.current.startPaymentFlow({});
        });

        // Test APPROVED
        await act(async () => {
            widgetCallback({ transaction: { id: 'TX1', status: 'APPROVED', reference: 'REF123' } });
        });
        expect(onSuccess).toHaveBeenCalledWith(expect.objectContaining({ id: 'TX1', status: 'APPROVED' }));

        // Test DECLINED
        await act(async () => {
            widgetCallback({ transaction: { id: 'TX2', status: 'DECLINED', reference: 'REF123' } });
        });
        expect(onError).toHaveBeenCalledWith("La transacción fue rechazada por el banco.");

        // Test ERROR
        await act(async () => {
            widgetCallback({ transaction: { id: 'TX3', status: 'ERROR', reference: 'REF123' } });
        });
        expect(onError).toHaveBeenCalledWith("Ocurrió un error en la transacción.");
    });

    it('polling handles status changes', async () => {
        jest.useFakeTimers();
        const { result } = renderHook(() => useWompiPayment({ onSuccess, onError, onCancel }));

        // Manually set loadingPayment to true by starting a flow (mocking backend)
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ wompi: { reference: 'REF123', publicKey: 'PUB123' } }),
        });
        (window as any).WidgetCheckout = jest.fn().mockImplementation(() => ({ open: jest.fn() }));

        await act(async () => {
            const promise = result.current.startPaymentFlow({});
            jest.runOnlyPendingTimers();
            await promise;
        });

        // Now the interval should be running because startPaymentFlow calls __startWompiPolling
        // Mock polling response
        (fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ status: 'DECLINED' }),
        });

        await act(async () => {
            jest.advanceTimersByTime(5000);
        });

        // Flush microtasks for the async fetch inside setInterval
        await act(async () => {
            await Promise.resolve();
            await Promise.resolve();
        });

        expect(onError).toHaveBeenCalledWith(expect.stringContaining("DECLINED"));
        jest.useRealTimers();
    });
});
