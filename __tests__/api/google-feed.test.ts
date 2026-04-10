import { GET } from '../../src/app/api/catalog/google-feed/route';
import { apiClient } from '@/lib/api-client';

jest.mock('@/lib/api-client', () => ({
    apiClient: jest.fn()
}));

// Mock NextResponse
jest.mock('next/server', () => ({
    NextResponse: class {
        constructor(public body: string, public init: any) { }
        static json(data: any, init: any) { return new this(JSON.stringify(data), init); }
        async text() { return this.body; }
        get status() { return this.init?.status || 200; }
    }
}));

describe('Google Feed API', () => {
    beforeEach(() => {
        jest.clearAllMocks();
    });

    it('generates a valid XML feed with products', async () => {
        const mockProducts = [
            {
                sku: 'SKU123',
                clothing_name: 'Camiseta Test',
                color_name: 'Negro',
                size_name: 'M',
                price: 89900,
                discount_price: 79900,
                image_url: 'https://img.com/1.jpg',
                additional_images: ['https://img.com/2.jpg'],
                slug: 'camiseta-test',
                quantity_available: 10,
                gender_name: 'Masculino',
                type_clothing_name: 'camiseta',
                design_reference: 'REF1',
                design_description: 'Desc 1'
            },
            {
                sku: 'SKU456',
                clothing_name: 'No Image',
                image_url: null, // Should be filtered out
                additional_images: [],
                price: 50000,
                quantity_available: 5,
                gender_name: 'Unisex'
            }
        ];

        (apiClient as jest.Mock).mockResolvedValue(mockProducts);

        const response = await GET();
        const xml = await response.text();

        expect(response.status).toBe(200);
        expect(xml).toContain('<?xml version="1.0" encoding="UTF-8"?>');
        expect(xml).toContain('<g:id>SKU123</g:id>');
        expect(xml).toContain('<g:title>Camiseta Test - Negro - M</g:title>');
        expect(xml).toContain('<g:sale_price>79900.00 COP</g:sale_price>');
        expect(xml).not.toContain('No Image'); // Filtered out
    });

    it('returns empty valid feed on error', async () => {
        (apiClient as jest.Mock).mockRejectedValue(new Error('API Down'));

        const response = await GET();
        const xml = await response.text();

        expect(response.status).toBe(200);
        expect(xml).toContain('Feed temporarily unavailable');
    });
});
