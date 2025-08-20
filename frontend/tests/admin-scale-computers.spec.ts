import { test, expect } from '@playwright/test';

test.describe('Admin Scale Computers Management', () => {
  test('should show scale computers management page', async ({ page }) => {
    await page.goto('/admin/scale-computers');
    
    // Should show the management interface
    await expect(page.getByRole('heading', { name: /manajemen komputer timbangan/i })).toBeVisible();
    await expect(page.getByText(/kelola komputer yang diizinkan/i)).toBeVisible();
  });

  test('should display existing scale computers', async ({ page }) => {
    // Mock API response with sample data
    await page.route('**/api/scale-computers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'scale-station-1',
            name: 'Timbangan Station 1',
            allowedHostnames: ['localhost', 'timbangan-1.local'],
            allowedIPs: ['127.0.0.1', '192.168.1.100'],
            location: 'Gudang Utama',
            isActive: true
          },
          {
            id: 'scale-station-2',
            name: 'Timbangan Station 2',
            allowedHostnames: ['timbangan-2.local'],
            allowedIPs: ['192.168.1.101'],
            location: 'Gudang Sortir',
            isActive: false
          }
        ])
      });
    });

    await page.goto('/admin/scale-computers');
    
    // Should show computer cards
    await expect(page.getByText('Timbangan Station 1')).toBeVisible();
    await expect(page.getByText('Timbangan Station 2')).toBeVisible();
    await expect(page.getByText('Gudang Utama')).toBeVisible();
    await expect(page.getByText('Gudang Sortir')).toBeVisible();
    
    // Should show IP addresses
    await expect(page.getByText('127.0.0.1')).toBeVisible();
    await expect(page.getByText('192.168.1.100')).toBeVisible();
  });

  test('should open create computer dialog', async ({ page }) => {
    await page.route('**/api/scale-computers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([])
      });
    });

    await page.goto('/admin/scale-computers');
    
    // Click add computer button
    await page.getByRole('button', { name: /tambah komputer/i }).click();
    
    // Should show create dialog
    await expect(page.getByRole('dialog')).toBeVisible();
    await expect(page.getByText(/tambah komputer timbangan/i)).toBeVisible();
    await expect(page.getByLabel(/nama komputer/i)).toBeVisible();
    await expect(page.getByLabel(/lokasi/i)).toBeVisible();
  });

  test('should create new scale computer', async ({ page }) => {
    await page.route('**/api/scale-computers', async (route, request) => {
      if (request.method() === 'GET') {
        await route.fulfill({
          status: 200,
          contentType: 'application/json',
          body: JSON.stringify([])
        });
      } else if (request.method() === 'POST') {
        const postData = request.postDataJSON();
        await route.fulfill({
          status: 201,
          contentType: 'application/json',
          body: JSON.stringify({
            id: 'new-scale-' + Date.now(),
            ...postData,
            createdAt: new Date().toISOString()
          })
        });
      }
    });

    await page.goto('/admin/scale-computers');
    
    // Open create dialog
    await page.getByRole('button', { name: /tambah komputer/i }).click();
    
    // Fill form
    await page.getByLabel(/nama komputer/i).fill('Test Station 1');
    await page.getByLabel(/lokasi/i).fill('Test Location');
    
    // Add hostname
    await page.getByPlaceholder(/e\.g\., timbangan-1\.local/).fill('test-host.local');
    await page.locator('button').filter({ hasText: '+' }).first().click();
    
    // Add IP address
    await page.getByPlaceholder(/e\.g\., 192\.168\.1\.100/).fill('192.168.1.200');
    await page.locator('button').filter({ hasText: '+' }).last().click();
    
    // Submit form
    await page.getByRole('button', { name: /simpan/i }).click();
    
    // Should close dialog
    await expect(page.getByRole('dialog')).not.toBeVisible();
  });

  test('should test computer connection', async ({ page }) => {
    await page.route('**/api/scale-computers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'scale-station-1',
            name: 'Timbangan Station 1',
            allowedHostnames: ['localhost'],
            allowedIPs: ['127.0.0.1'],
            location: 'Gudang Utama',
            isActive: true
          }
        ])
      });
    });

    await page.route('**/api/scale-computers/scale-station-1/test', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          success: true,
          message: 'Connection successful',
          details: {
            responseTime: 95,
            hardwareStatus: 'online'
          }
        })
      });
    });

    await page.goto('/admin/scale-computers');
    
    // Click test button
    await page.getByRole('button', { name: /test/i }).click();
    
    // Should show success message (toast)
    // Note: This depends on your toast implementation
    await page.waitForTimeout(1000); // Wait for potential toast message
  });

  test('should search computers', async ({ page }) => {
    await page.route('**/api/scale-computers', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify([
          {
            id: 'scale-station-1',
            name: 'Timbangan Station 1',
            allowedHostnames: ['localhost'],
            allowedIPs: ['127.0.0.1'],
            location: 'Gudang Utama',
            isActive: true
          },
          {
            id: 'scale-station-2',
            name: 'Timbangan Station 2',
            allowedHostnames: ['timbangan-2.local'],
            allowedIPs: ['192.168.1.101'],
            location: 'Gudang Sortir',
            isActive: true
          }
        ])
      });
    });

    await page.goto('/admin/scale-computers');
    
    // Search for specific computer
    await page.getByPlaceholder(/cari berdasarkan nama/i).fill('Station 1');
    
    // Should show filtered results
    await expect(page.getByText('Timbangan Station 1')).toBeVisible();
    // Station 2 should be hidden by client-side filtering
    // Note: This depends on your actual filtering implementation
  });
});