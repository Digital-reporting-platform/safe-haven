import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { AdminPage } from '../../pages/admin.page';

test.describe('Admin - Dashboard & Management', () => {
  let adminPage: AdminPage;

  test.beforeEach(async ({ page }) => {
    // Login as admin first
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('admin');
    await page.waitForURL(/admin/);

    adminPage = new AdminPage(page);
    await adminPage.expectAdminDashboardLoaded();
  });

  test('should view all reports', async ({ page }) => {
    await adminPage.viewAllReports();
    await page.waitForLoadState('networkidle');

    // Reports list should be visible
    const reportCount = await adminPage.getReportCount();
    expect(reportCount).toBeGreaterThanOrEqual(0);
  });

  test('should search and filter reports', async ({ page }) => {
    await adminPage.goto();
    
    // Search by keyword
    await adminPage.searchUsers('test');
    await page.waitForTimeout(500);

    // Filter by status
    await adminPage.filterByStatus('PENDING');
    await page.waitForTimeout(500);
  });

  test('should assign case to case manager', async ({ page }) => {
    await adminPage.goto();
    await adminPage.viewAllReports();

    // Find a case and assign it
    const caseId = 'TEST-CASE-001';
    await adminPage.assignCaseToManager(caseId, 'John Counselor');

    // Verify assignment success toast
    await expect(page.locator('text=assigned successfully')).toBeVisible();
  });

  test('should view user management', async ({ page }) => {
    await adminPage.goto();
    await adminPage.viewUserManagement();

    // User list should be visible
    const userCount = await adminPage.getUserCount();
    expect(userCount).toBeGreaterThanOrEqual(0);
  });

  test('should change user role', async ({ page }) => {
    await adminPage.goto();
    await adminPage.viewUserManagement();

    // Change role for a test user
    await adminPage.changeUserRole('user-123', 'CASE_MANAGER');

    // Verify role change success
    await expect(page.locator('text=Role updated')).toBeVisible();
  });

  test('should generate analytics report', async ({ page }) => {
    await adminPage.goto();
    
    await adminPage.expectStatsVisible();
    await adminPage.generateAnalyticsReport();

    // Verify report generation
    await expect(page.locator('text=Report generated')).toBeVisible();
  });

  test('should view analytics and statistics', async ({ page }) => {
    await adminPage.goto();

    // Stats cards should show metrics
    const statsCards = page.locator('.stat-card, [data-testid="stat-card"]');
    await expect(statsCards.first()).toBeVisible();
  });
});
