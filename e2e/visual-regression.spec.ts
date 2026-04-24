import { test, expect } from '@playwright/test';

const getMasks = (page: import('@playwright/test').Page) => ({
  mask: [
    page.locator('img'), 
    page.locator('video'),
  ],
});

test.describe('Visual Regression Testing - Two Six Web', () => {
  test('Home Page - Desktop', async ({ page }) => {
    // Navigate to Home
    await page.goto('/');
    
    // Wait for the main elements to load (e.g. hero section)
    await page.waitForSelector('main');
    
    // Allow a small threshold for font rendering differences across CI environments
    await expect(page).toHaveScreenshot('home-desktop.png', {
      maxDiffPixelRatio: 0.05,
      ...getMasks(page)
    });
  });

  test('Catalog Page - Desktop', async ({ page }) => {
    await page.goto('/catalog');
    
    // Wait for the product grid to load
    await page.waitForSelector('.grid');

    await expect(page).toHaveScreenshot('catalog-desktop.png', {
      maxDiffPixelRatio: 0.05,
      ...getMasks(page)
    });
  });

  test('Home Page - Mobile', async ({ page }) => {
    // Set viewport to a common mobile size (e.g. iPhone 13)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('/');
    
    await page.waitForSelector('main');

    await expect(page).toHaveScreenshot('home-mobile.png', {
      maxDiffPixelRatio: 0.05,
      ...getMasks(page)
    });
  });
});
