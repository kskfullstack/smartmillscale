import { test, expect } from '@playwright/test';

test.describe('Scale Access Control', () => {
  test('should show access control check on timbangan page', async ({ page }) => {
    // Mock the scale access API to deny access
    await page.route('**/api/scale/access-config', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hasAccess: false,
          allowedIPs: ['192.168.1.100'],
          currentIP: '127.0.0.1',
          currentHostname: 'localhost',
          station: null
        })
      });
    });

    await page.goto('/timbangan');
    
    // Should show access denied message
    await expect(page.getByText(/akses timbangan terbatas/i)).toBeVisible();
    await expect(page.getByText(/komputer yang terhubung langsung/i)).toBeVisible();
  });

  test('should show computer information when access denied', async ({ page }) => {
    await page.route('**/api/scale/access-config', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hasAccess: false,
          allowedIPs: ['192.168.1.100', '192.168.1.101'],
          currentIP: '127.0.0.1',
          currentHostname: 'localhost',
          station: null
        })
      });
    });

    await page.goto('/timbangan');
    
    // Should show computer info
    await expect(page.getByText(/informasi komputer saat ini/i)).toBeVisible();
    await expect(page.getByText(/hostname/i)).toBeVisible();
    await expect(page.getByText(/localhost/)).toBeVisible();
  });

  test('should allow access for authorized computer', async ({ page }) => {
    // Mock successful access
    await page.route('**/api/scale/access-config', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hasAccess: true,
          allowedIPs: ['127.0.0.1'],
          currentIP: '127.0.0.1',
          currentHostname: 'localhost',
          station: {
            id: 'scale-station-1',
            name: 'Timbangan Station 1',
            location: 'Gudang Utama'
          }
        })
      });
    });

    // Mock successful hardware connection test
    await page.route('**/api/scale/test-connection', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          connected: true,
          status: 'online',
          lastWeight: 150.5
        })
      });
    });

    await page.goto('/timbangan');
    
    // Should show the actual timbangan interface (not access denied)
    await expect(page.getByText(/akses timbangan terbatas/i)).not.toBeVisible();
    // Should show timbangan form or interface
    await expect(page.getByText(/timbangan/i)).toBeVisible();
  });

  test('should show connection status when hardware is offline', async ({ page }) => {
    // Mock computer access but hardware offline
    await page.route('**/api/scale/access-config', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          hasAccess: true,
          allowedIPs: ['127.0.0.1'],
          currentIP: '127.0.0.1',
          currentHostname: 'localhost',
          station: {
            id: 'scale-station-1',
            name: 'Timbangan Station 1'
          }
        })
      });
    });

    await page.route('**/api/scale/test-connection', async route => {
      await route.fulfill({
        status: 200,
        contentType: 'application/json',
        body: JSON.stringify({
          connected: false,
          status: 'offline',
          error: 'Hardware not responding'
        })
      });
    });

    await page.goto('/timbangan');
    
    // Should show connection status screen
    await expect(page.getByText(/koneksi timbangan/i)).toBeVisible();
    await expect(page.getByText(/test koneksi/i)).toBeVisible();
  });
});