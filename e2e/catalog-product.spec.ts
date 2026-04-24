import { test, expect } from '@playwright/test';

test.describe('Catálogo y Detalle de Producto', () => {
    test('la página de categoría Hombre muestra productos', async ({ page }) => {
        await page.goto('/man');

        // Verify section banner
        await expect(page.getByText('Hombre').first()).toBeVisible();

        // Wait for products to load from API
        await page.waitForLoadState('networkidle');

        // Verify at least one product link exists
        const productLinks = page.locator('a[href^="/product/"]');
        await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
        const count = await productLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('la página de categoría Mujer muestra productos', async ({ page }) => {
        await page.goto('/woman');

        await expect(page.getByText('Mujer').first()).toBeVisible();
        await page.waitForLoadState('networkidle');

        const productLinks = page.locator('a[href^="/product/"]');
        await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
        const count = await productLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('la página de Unisex muestra productos', async ({ page }) => {
        await page.goto('/unisex');

        await expect(page.getByText('Unisex').first()).toBeVisible();
        await page.waitForLoadState('networkidle');

        const productLinks = page.locator('a[href^="/product/"]');
        await expect(productLinks.first()).toBeVisible({ timeout: 10000 });
        const count = await productLinks.count();
        expect(count).toBeGreaterThan(0);
    });

    test('navegar a un producto desde el catálogo muestra la página de detalle', async ({ page }) => {
        await page.goto('/man');
        await page.waitForLoadState('networkidle');

        // Click on the first product card
        const firstProduct = page.locator('a[href^="/product/"]').first();
        await expect(firstProduct).toBeVisible({ timeout: 10000 });

        // Get the product name before clicking
        const productName = await firstProduct.locator('h3').textContent();

        await firstProduct.click();

        // Verify we're on the product detail page
        await page.waitForURL(/\/product\/.+/);

        // Verify product name is displayed
        await expect(page.getByRole('heading', { level: 1 })).toBeVisible();
    });

    test('la página de detalle muestra colores, tallas y precio', async ({ page }) => {
        await page.goto('/man');
        await page.waitForLoadState('networkidle');

        // Click on first product
        const firstProduct = page.locator('a[href^="/product/"]').first();
        await expect(firstProduct).toBeVisible({ timeout: 10000 });
        await firstProduct.click();
        await page.waitForURL(/\/product\/.+/);
        await page.waitForLoadState('networkidle');

        // Verify Color section
        await expect(page.getByText('Color').first()).toBeVisible();

        // Verify Size section 
        await expect(page.getByText('Talla').first()).toBeVisible();

        // Verify Price is displayed (contains $)
        await expect(page.getByText('$').first()).toBeVisible();
        
        // Verify "Añadir a la Bolsa" or "Agotado" button
        const addToCartBtn = page.getByText('Añadir a la Bolsa');
        const outOfStockBtn = page.getByText('Agotado');
        const isAddVisible = await addToCartBtn.isVisible().catch(() => false);
        const isOutVisible = await outOfStockBtn.isVisible().catch(() => false);
        expect(isAddVisible || isOutVisible).toBeTruthy();
    });

    test('la página de detalle muestra las secciones del acordeón', async ({ page }) => {
        await page.goto('/man');
        await page.waitForLoadState('networkidle');

        const firstProduct = page.locator('a[href^="/product/"]').first();
        await expect(firstProduct).toBeVisible({ timeout: 10000 });
        await firstProduct.click();
        await page.waitForURL(/\/product\/.+/);
        await page.waitForLoadState('networkidle');

        // Verify accordion sections
        await expect(page.getByText('Descripción', { exact: true })).toBeVisible({ timeout: 10000 });
        await expect(page.getByText('Detalles del Producto')).toBeVisible();
        await expect(page.getByText('Envíos y Devoluciones')).toBeVisible();
    });
});
