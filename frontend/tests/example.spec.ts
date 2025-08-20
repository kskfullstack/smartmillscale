import { test, expect } from '@playwright/test';

test('has title', async ({ page }) => {
  await page.goto('/');

  // Expect a title "to contain" a substring.
  await expect(page).toHaveTitle(/SmartMillScale/);
});

test('dashboard navigation', async ({ page }) => {
  await page.goto('/');

  // Click the dashboard timbangan card
  await page.locator('text=Dashboard Timbangan').click();

  // Should navigate to timbangan dashboard
  await expect(page).toHaveURL(/.*dashboard-timbangan/);
});