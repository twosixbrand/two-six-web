

describe('apiClient', () => {
    let originalEnv: NodeJS.ProcessEnv;

    beforeAll(() => {
        originalEnv = process.env;
    });

    afterAll(() => {
        process.env = originalEnv;
    });

    beforeEach(() => {
        jest.resetModules();
        global.fetch = jest.fn();
    });

    it('throws error if NEXT_PUBLIC_API_URL is missing', () => {
        process.env.NEXT_PUBLIC_API_URL = '';
        expect(() => require('../../src/lib/api-client')).toThrow('La variable de entorno NEXT_PUBLIC_API_URL no está definida.');
    });

    it('makes a GET request with correct URL and headers', async () => {
        process.env.NEXT_PUBLIC_API_URL = 'https://api.test.com';
        const { apiClient } = require('../../src/lib/api-client');

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        const result = await apiClient('/test-endpoint');

        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.test.com/api/test-endpoint',
            expect.any(Object)
        );
        expect(result).toEqual({ success: true });
    });

    it('handles query parameters correctly', async () => {
        process.env.NEXT_PUBLIC_API_URL = 'https://api.test.com';
        const { apiClient } = require('../../src/lib/api-client');
        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: true,
            json: async () => ({ success: true }),
        });

        await apiClient('/test', { params: { foo: 'bar', age: 25 } });

        expect(global.fetch).toHaveBeenCalledWith(
            'https://api.test.com/api/test?foo=bar&age=25',
            expect.any(Object)
        );
    });

    it('throws error when response is not ok', async () => {
        process.env.NEXT_PUBLIC_API_URL = 'https://api.test.com';
        const { apiClient } = require('../../src/lib/api-client');

        (global.fetch as jest.Mock).mockResolvedValueOnce({
            ok: false,
            status: 404,
            statusText: 'Not Found',
            text: async () => 'Resource not found',
        });

        await expect(apiClient('/fail')).rejects.toThrow('Error en la API: 404 Not Found - Resource not found');
    });

    it('rethrows network errors', async () => {
        process.env.NEXT_PUBLIC_API_URL = 'https://api.test.com';
        const { apiClient } = require('../../src/lib/api-client');

        (global.fetch as jest.Mock).mockRejectedValueOnce(new Error('Network failure'));

        await expect(apiClient('/error')).rejects.toThrow('Network failure');
    });
});
