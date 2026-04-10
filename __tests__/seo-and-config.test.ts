// Mock lib/blog BEFORE imports to avoid remark syntax error
jest.mock('../src/lib/blog', () => ({
    getPostSlugs: jest.fn().mockReturnValue(['post-1', 'post-2']),
    getPostBySlug: jest.fn().mockResolvedValue({ slug: 'test' })
}));

import robots from '../src/app/robots';
import sitemap from '../src/app/sitemap';

describe('SEO Configuration', () => {
    it('robots.ts: returns correct robots configuration', () => {
        const result = robots();
        expect(result).toHaveProperty('rules');
        expect(result).toHaveProperty('sitemap');
        expect(result.sitemap).toContain('/sitemap.xml');
    });

    it('sitemap.ts: generates full sitemap with core routes', async () => {
        const result = await sitemap();
        const urls = result.map(item => item.url);
        
        expect(urls).toContain('https://twosixweb.com');
        expect(urls).toContain('https://twosixweb.com/catalog');
        expect(urls).toContain('https://twosixweb.com/blog');
        expect(urls).toContain('https://twosixweb.com/sobre-nosotros');
    });
});
