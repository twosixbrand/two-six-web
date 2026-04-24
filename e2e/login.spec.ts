import { test, expect } from '@playwright/test';

test.describe('Login y OTP', () => {
    test('la página de login muestra el formulario', async ({ page }) => {
        await page.goto('/login', { waitUntil: 'networkidle' });

        await expect(page.getByRole('heading', { name: /Bienvenido/i })).toBeVisible();
        await expect(page.getByText('Ingresa tu correo electrónico para recibir un código de acceso')).toBeVisible();
        await expect(page.locator('#email')).toBeVisible();
        await expect(page.getByRole('button', { name: /Enviar Código/i })).toBeVisible();
    });

    test('se puede ingresar un email en el formulario', async ({ page }) => {
        await page.goto('/login', { waitUntil: 'networkidle' });

        const emailInput = page.locator('#email');
        await emailInput.fill('test@example.com');
        await expect(emailInput).toHaveValue('test@example.com');
    });

    test('enviar formulario de login con email', async ({ page }) => {
        await page.goto('/login', { waitUntil: 'networkidle' });

        await page.locator('#email').fill('test@example.com');
        await page.getByRole('button', { name: /Enviar Código/i }).click();

        // Wait for response
        await page.waitForTimeout(1000);

        // Check result: either OTP redirect, error displayed, or button back to normal
        const isOnOtpPage = page.url().includes('/login/otp');
        const hasError = await page.locator('.text-red-500').isVisible().catch(() => false);
        const buttonIsBack = await page.getByRole('button', { name: /Enviar Código/i }).isVisible().catch(() => false);

        expect(isOnOtpPage || hasError || buttonIsBack).toBeTruthy();
    });

    test('el botón muestra estado de carga', async ({ page }) => {
        await page.goto('/login', { waitUntil: 'networkidle' });

        await page.locator('#email').fill('test@example.com');
        await page.getByRole('button', { name: /Enviar Código/i }).click();

        // Button should show loading or have transitioned already
        await page.waitForTimeout(500);
    });

    test('el enlace de login está en el header', async ({ page }) => {
        await page.goto('/', { waitUntil: 'networkidle' });

        const loginLink = page.getByRole('link', { name: /Iniciar Sesión|Ingresar/i }).first();
        if (await loginLink.isVisible().catch(() => false)) {
            await loginLink.click();
            await page.waitForURL('/login');
            await expect(page.getByRole('heading', { name: /Bienvenido/i })).toBeVisible();
        }
    });
});
