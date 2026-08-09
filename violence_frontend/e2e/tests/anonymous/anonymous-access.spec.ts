import { test, expect } from '@playwright/test';

test.describe('Anonymous User - Access Control', () => {
  test('should redirect anonymous user from dashboard to login', async ({ page }) => {
    await page.goto('/survivor/dashboard');
    await page.waitForLoadState('networkidle');
    
    // Should redirect to login
    await expect(page).toHaveURL(/login|auth/);
  });

  test('should redirect anonymous user from admin to login', async ({ page }) => {
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/login|auth/);
  });

  test('should redirect anonymous user from case manager routes to login', async ({ page }) => {
    await page.goto('/counselor/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/login|auth/);
  });

  test('should redirect anonymous user from medical provider routes to login', async ({ page }) => {
    await page.goto('/medical-provider/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/login|auth/);
  });

  test('should redirect anonymous user from legal routes to login', async ({ page }) => {
    await page.goto('/legal/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/login|auth/);
  });

  test('should redirect anonymous user from moderator routes to login', async ({ page }) => {
    await page.goto('/moderator/dashboard');
    await page.waitForLoadState('networkidle');
    
    await expect(page).toHaveURL(/login|auth/);
  });

  test('should allow anonymous access to public pages', async ({ page }) => {
    const publicPages = [
      '/',
      '/about',
      '/resources',
      '/report',
      '/support-services',
      '/recovery-hub',
      '/transparency',
    ];

    for (const path of publicPages) {
      await page.goto(path);
      await page.waitForLoadState('networkidle');
      
      // Should stay on the page
      await expect(page).toHaveURL(path);
    }
  });
});
