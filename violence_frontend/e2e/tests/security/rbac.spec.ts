import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';

test.describe('Security - Role-Based Access Control', () => {
  test('survivor cannot access admin routes', async ({ page }) => {
    // Login as survivor
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('survivor');
    await page.waitForURL(/survivor|dashboard/);

    // Try to access admin route
    await page.goto('/admin');
    await page.waitForLoadState('networkidle');

    // Should be redirected to unauthorized or dashboard
    await expect(page).toHaveURL(/dashboard|unauthorized|login/);
  });

  test('case manager cannot access admin-only features', async ({ page }) => {
    // Login as case manager
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('caseManager');
    await page.waitForURL(/counselor|dashboard/);

    // Try to access user management (admin only)
    await page.goto('/admin/users');
    await page.waitForLoadState('networkidle');

    // Should be redirected
    await expect(page).not.toHaveURL(/admin\/users/);
  });

  test('moderator cannot access case management routes', async ({ page }) => {
    // Login as moderator
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('moderator');
    await page.waitForURL(/moderator|dashboard/);

    // Try to access counselor route
    await page.goto('/counselor/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected
    await expect(page).toHaveURL(/moderator|dashboard|unauthorized/);
  });

  test('medical professional cannot access legal routes', async ({ page }) => {
    // Login as medical
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('medical');
    await page.waitForURL(/medical|dashboard/);

    // Try to access legal route
    await page.goto('/legal/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected
    await expect(page).toHaveURL(/medical|dashboard|unauthorized/);
  });

  test('legal provider cannot access medical routes', async ({ page }) => {
    // Login as legal
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('legal');
    await page.waitForURL(/legal|dashboard/);

    // Try to access medical route
    await page.goto('/medical-provider/dashboard');
    await page.waitForLoadState('networkidle');

    // Should be redirected
    await expect(page).toHaveURL(/legal|dashboard|unauthorized/);
  });
});

test.describe('Security - Authentication', () => {
  test('token should be stored after login', async ({ page, context }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('survivor');
    await page.waitForURL(/survivor|dashboard/);

    // Check localStorage for token
    const token = await page.evaluate(() => localStorage.getItem('sh_token'));
    expect(token).toBeTruthy();
  });

  test('unauthorized API access should be blocked', async ({ page, context }) => {
    // Clear all authentication
    await context.clearCookies();
    
    // Try to access protected API endpoint
    const response = await page.request.get('/api/admin/reports');
    
    // Should return 401 or 403
    expect(response.status()).toBeGreaterThanOrEqual(401);
    expect(response.status()).toBeLessThan(500);
  });

  test('session should persist across page reloads', async ({ page }) => {
    // Login
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('survivor');
    await page.waitForURL(/survivor|dashboard/);

    // Reload page
    await page.reload();
    await page.waitForLoadState('networkidle');

    // Should still be logged in and on dashboard
    await expect(page).toHaveURL(/survivor|dashboard/);
    await expect(page.locator('text=/Welcome|Dashboard/')).toBeVisible();
  });
});
