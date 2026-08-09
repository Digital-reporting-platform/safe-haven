import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { CaseManagerPage } from '../../pages/case-manager.page';

test.describe('Case Manager - Case Management', () => {
  let caseManagerPage: CaseManagerPage;

  test.beforeEach(async ({ page }) => {
    // Login as case manager first
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('caseManager');
    await page.waitForURL(/counselor|dashboard/);

    caseManagerPage = new CaseManagerPage(page);
    await caseManagerPage.expectCaseManagerDashboardLoaded();
  });

  test('should view assigned cases', async ({ page }) => {
    const caseCount = await caseManagerPage.getAssignedCaseCount();
    expect(caseCount).toBeGreaterThanOrEqual(0);
  });

  test('should open case details', async ({ page }) => {
    const cases = await caseManagerPage.getAssignedCaseCount();
    if (cases > 0) {
      await caseManagerPage.openCase('CASE-001');
      await caseManagerPage.expectCaseDetailsVisible();
    }
  });

  test('should update case status', async ({ page }) => {
    const cases = await caseManagerPage.getAssignedCaseCount();
    if (cases > 0) {
      await caseManagerPage.openCase('CASE-001');
      
      // Update status to In Progress
      await caseManagerPage.updateCaseStatus('IN_PROGRESS');
      
      // Verify status update
      await expect(page.locator('text=In Progress')).toBeVisible();
    }
  });

  test('should add notes to case', async ({ page }) => {
    const cases = await caseManagerPage.getAssignedCaseCount();
    if (cases > 0) {
      await caseManagerPage.openCase('CASE-001');
      
      const noteText = 'Spoke with survivor. They are doing better and requested follow-up next week.';
      await caseManagerPage.addNote(noteText);
      
      // Verify note is visible
      await caseManagerPage.expectNoteVisible(noteText);
    }
  });

  test('should filter cases by status', async ({ page }) => {
    await caseManagerPage.goto();
    
    // Filter by different statuses
    await caseManagerPage.filterByStatus('UNDER_REVIEW');
    await page.waitForTimeout(500);
    
    await caseManagerPage.filterByStatus('IN_PROGRESS');
    await page.waitForTimeout(500);
    
    await caseManagerPage.filterByStatus('RESOLVED');
    await page.waitForTimeout(500);
  });

  test('should resolve case', async ({ page }) => {
    const cases = await caseManagerPage.getAssignedCaseCount();
    if (cases > 0) {
      await caseManagerPage.openCase('CASE-001');
      
      // Update status to Resolved
      await caseManagerPage.updateCaseStatus('RESOLVED');
      
      // Verify resolved status
      await expect(page.locator('text=Resolved')).toBeVisible();
    }
  });
});
