import { test, expect } from '@playwright/test';

test.describe('Basic Application Tests', () => {
  test('should load homepage', async ({ page }) => {
    await page.goto('/');
    
    // Should show main dashboard
    await expect(page.locator('text=SmartMillScale')).toBeVisible();
  });

  test('should show login page', async ({ page }) => {
    await page.goto('/login');
    
    // Should show login form
    await expect(page.locator('text=Login')).toBeVisible();
  });

  test('should redirect protected route to login', async ({ page }) => {
    await page.goto('/admin/scale-computers');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*login/);
  });
});