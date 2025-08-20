import { test, expect } from '@playwright/test';

test.describe('Authentication', () => {
  test('should redirect to login page when not authenticated', async ({ page }) => {
    await page.goto('/dashboard-timbangan');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
    await expect(page.getByRole('heading', { name: /login/i })).toBeVisible();
  });

  test('should show login form', async ({ page }) => {
    await page.goto('/login');
    
    // Check login form elements
    await expect(page.getByLabel(/username/i)).toBeVisible();
    await expect(page.getByLabel(/password/i)).toBeVisible();
    await expect(page.getByRole('button', { name: /login/i })).toBeVisible();
  });

  test('should handle login attempt', async ({ page }) => {
    await page.goto('/login');
    
    // Fill in login form
    await page.getByLabel(/username/i).fill('admin');
    await page.getByLabel(/password/i).fill('password');
    
    // Click login button
    await page.getByRole('button', { name: /login/i }).click();
    
    // Should show some response (either success redirect or error message)
    // This will depend on your actual backend implementation
    await page.waitForLoadState('networkidle');
  });
});

test.describe('Protected Routes', () => {
  test('admin routes should be protected', async ({ page }) => {
    await page.goto('/admin/scale-computers');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('dashboard routes should be protected', async ({ page }) => {
    await page.goto('/dashboard-timbangan');
    
    // Should redirect to login  
    await expect(page).toHaveURL(/.*\/login/);
  });

  test('timbangan route should be protected', async ({ page }) => {
    await page.goto('/timbangan');
    
    // Should redirect to login
    await expect(page).toHaveURL(/.*\/login/);
  });
});