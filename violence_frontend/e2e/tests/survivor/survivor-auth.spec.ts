import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { RegisterPage } from '../../pages/register.page';
import { DashboardPage } from '../../pages/dashboard.page';
import { ReportPage } from '../../pages/report.page';

test.describe('Survivor - Authentication', () => {
  test('should register new account successfully', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    const timestamp = Date.now();
    await registerPage.register({
      firstName: 'Test',
      lastName: 'Survivor',
      email: `test.survivor.${timestamp}@example.com`,
      phone: '+251911234567',
      password: 'TestPassword123!',
      confirmPassword: 'TestPassword123!',
    });

    await registerPage.expectRegistrationSuccess();
    // Should redirect to verification or login page
    await expect(page).toHaveURL(/verify-email|login/);
  });

  test('should show validation error for mismatched passwords', async ({ page }) => {
    const registerPage = new RegisterPage(page);
    await registerPage.goto();

    await registerPage.register({
      firstName: 'Test',
      lastName: 'User',
      email: 'test@example.com',
      phone: '+251911234567',
      password: 'TestPassword123!',
      confirmPassword: 'DifferentPassword123!',
    });

    await registerPage.expectRegistrationError('passwords do not match');
  });

  test('should login successfully and redirect to dashboard', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    await loginPage.goto();
    await loginPage.login('survivor@test.com', 'TestPassword123!');

    await dashboardPage.expectDashboardLoaded();
    await expect(page).toHaveURL(/survivor|dashboard/);
  });

  test('should show error for invalid credentials', async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();

    await loginPage.login('invalid@example.com', 'wrongpassword');
    await loginPage.expectLoginError('Invalid credentials');
  });

  test('should logout successfully', async ({ page }) => {
    const loginPage = new LoginPage(page);
    const dashboardPage = new DashboardPage(page);

    // Login first
    await loginPage.goto();
    await loginPage.login('survivor@test.com', 'TestPassword123!');
    await dashboardPage.expectDashboardLoaded();

    // Logout
    await dashboardPage.logout();
    await expect(page).toHaveURL(/login|auth/);
  });
});

test.describe('Survivor - Dashboard & Cases', () => {
  let dashboardPage: DashboardPage;
  let reportPage: ReportPage;

  test.beforeEach(async ({ page }) => {
    // Login as survivor first
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.login('survivor@test.com', 'TestPassword123!');
    await page.waitForURL(/survivor|dashboard/);

    dashboardPage = new DashboardPage(page);
    reportPage = new ReportPage(page);
  });

  test('should view personal dashboard', async ({ page }) => {
    await dashboardPage.expectDashboardLoaded();
    
    // Check for dashboard elements
    await expect(page.locator('text=/My Cases|Active Cases/')).toBeVisible();
  });

  test('should submit report from dashboard', async ({ page }) => {
    await dashboardPage.clickNewReport();
    await expect(page).toHaveURL('/report');
  });

  test('should view my cases list', async ({ page }) => {
    await page.goto('/survivor/my-cases');
    await page.waitForLoadState('networkidle');

    // Cases list should be visible
    await expect(page.locator('text=/cases|No cases found/')).toBeVisible();
  });

  test('should track case status updates', async ({ page }) => {
    await page.goto('/survivor/my-cases');
    await page.waitForLoadState('networkidle');

    // Status badges should be visible for each case
    const statusBadges = page.locator('.status-badge, [data-testid="status"]');
    if (await statusBadges.count() > 0) {
      await expect(statusBadges.first()).toBeVisible();
    }
  });
});
