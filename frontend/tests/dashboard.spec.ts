import { test, expect } from '@playwright/test';

test.describe('Dashboard Navigation', () => {
  test('should show main dashboard with quick access cards', async ({ page }) => {
    await page.goto('/');
    
    // Should show main dashboard
    await expect(page.getByRole('heading', { name: /dashboard smartmillscale/i })).toBeVisible();
    await expect(page.getByText(/timbang otomatis, proses sistematis/i)).toBeVisible();
    
    // Should show quick access cards
    await expect(page.getByText(/dashboard timbangan/i)).toBeVisible();
    await expect(page.getByText(/dashboard grading/i)).toBeVisible();
  });

  test('should navigate to timbangan dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Click dashboard timbangan card
    await page.getByText(/dashboard timbangan/i).click();
    
    // Should navigate to timbangan dashboard
    await expect(page).toHaveURL(/.*dashboard-timbangan/);
  });

  test('should navigate to grading dashboard', async ({ page }) => {
    await page.goto('/');
    
    // Click dashboard grading card
    await page.getByText(/dashboard grading/i).click();
    
    // Should navigate to grading dashboard
    await expect(page).toHaveURL(/.*dashboard-grading/);
  });
});

test.describe('Timbangan Dashboard', () => {
  test('should show timbangan dashboard content', async ({ page }) => {
    // Mock scale access to allow viewing dashboard
    await page.route('**/api/scale/access-config', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hasAccess: true,
          currentIP: '127.0.0.1'
        })
      });
    });

    await page.goto('/dashboard-timbangan');
    
    // Should show timbangan dashboard
    await expect(page.getByRole('heading', { name: /dashboard operator timbangan/i })).toBeVisible();
    await expect(page.getByText(/sistem penimbangan real-time/i)).toBeVisible();
    
    // Should show performance metrics
    await expect(page.getByText(/target harian/i)).toBeVisible();
    await expect(page.getByText(/transaksi hari ini/i)).toBeVisible();
    await expect(page.getByText(/efisiensi/i)).toBeVisible();
  });

  test('should show scale status panel', async ({ page }) => {
    await page.route('**/api/scale/access-config', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hasAccess: true,
          currentIP: '127.0.0.1'
        })
      });
    });

    await page.goto('/dashboard-timbangan');
    
    // Should show scale status
    await expect(page.getByText(/status timbangan real-time/i)).toBeVisible();
    await expect(page.getByText(/berat saat ini/i)).toBeVisible();
    await expect(page.getByText(/status sistem/i)).toBeVisible();
  });

  test('should show restricted access for unauthorized computer', async ({ page }) => {
    // Mock scale access denial
    await page.route('**/api/scale/access-config', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hasAccess: false,
          currentIP: '127.0.0.1'
        })
      });
    });

    await page.goto('/dashboard-timbangan');
    
    // Should show restricted access indicators
    await expect(page.getByText(/akses terbatas/i)).toBeVisible();
  });
});

test.describe('Grading Dashboard', () => {
  test('should show grading dashboard content', async ({ page }) => {
    await page.goto('/dashboard-grading');
    
    // Should show grading dashboard
    await expect(page.getByRole('heading', { name: /dashboard operator grading/i })).toBeVisible();
    await expect(page.getByText(/sistem penilaian kualitas/i)).toBeVisible();
    
    // Should show quality metrics
    await expect(page.getByText(/grading hari ini/i)).toBeVisible();
    await expect(page.getByText(/distribusi grade/i)).toBeVisible();
  });

  test('should show quality status panel', async ({ page }) => {
    await page.goto('/dashboard-grading');
    
    // Should show quality status
    await expect(page.getByText(/status kualitas real-time/i)).toBeVisible();
    await expect(page.getByText(/quality score/i)).toBeVisible();
    await expect(page.getByText(/pending assessment/i)).toBeVisible();
  });

  test('should show recent assessments', async ({ page }) => {
    await page.goto('/dashboard-grading');
    
    // Should show assessment section
    await expect(page.getByText(/assessment terbaru/i)).toBeVisible();
    await expect(page.getByText(/pipeline penilaian kualitas/i)).toBeVisible();
  });
});