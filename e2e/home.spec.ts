import { test, expect } from '@playwright/test';

test.describe('Homepage y Navegación', () => {
    test('la página principal carga correctamente', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });

        await expect(page).toHaveTitle(/Two Six/i);
        await expect(page.getByText('Descubre tu Estilo')).toBeVisible({ timeout: 15000 });
    });

    test('muestra las categorías Hombre, Mujer y Unisex', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });

        await expect(page.getByRole('heading', { name: 'Hombre' }).first()).toBeVisible({ timeout: 15000 });
        await expect(page.getByRole('heading', { name: 'Mujer' }).first()).toBeVisible();
        await expect(page.getByRole('heading', { name: 'Unisex' }).first()).toBeVisible();
    });

    test('muestra el catálogo de novedades', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });

        await page.evaluate(() => window.scrollTo(0, document.body.scrollHeight));
        await page.waitForTimeout(2000);

        // Use heading role to disambiguate from "Explorar Novedades" link
        const novedadesHeading = page.getByRole('heading', { name: 'Novedades' });
        await expect(novedadesHeading).toBeVisible({ timeout: 15000 });
    });

    test('la navegación del header funciona', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });

        const header = page.getByRole('banner');
        await expect(header.getByRole('link', { name: 'two-six-web Logo' })).toBeVisible({ timeout: 15000 });

        await expect(page.getByRole('button', { name: 'Hombre' })).toBeVisible();
        await expect(page.getByRole('button', { name: 'Mujer' })).toBeVisible();
    });

    test('navega a la categoría Hombre', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });

        const hombreCard = page.locator('a[href="/man"]').filter({ has: page.locator('h3') }).first();
        await expect(hombreCard).toBeVisible({ timeout: 15000 });

        await hombreCard.click();
        await page.waitForURL('/man');
        await expect(page.getByText('Hombre').first()).toBeVisible();
    });

    test('navega a la categoría Mujer', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });

        const mujerCard = page.locator('a[href="/woman"]').filter({ has: page.locator('h3') }).first();
        await expect(mujerCard).toBeVisible({ timeout: 15000 });

        await mujerCard.click();
        await page.waitForURL('/woman');
        await expect(page.getByText('Mujer').first()).toBeVisible();
    });
});
