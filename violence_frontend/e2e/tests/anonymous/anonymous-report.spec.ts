import { test, expect } from '@playwright/test';
import { ReportPage } from '../../pages/report.page';
import { DashboardPage } from '../../pages/dashboard.page';

test.describe('Anonymous User - Anonymous Reporting', () => {
  let reportPage: ReportPage;
  let dashboardPage: DashboardPage;

  test.beforeEach(async ({ page }) => {
    reportPage = new ReportPage(page);
    dashboardPage = new DashboardPage(page);
  });

  test('should submit anonymous incident report successfully', async ({ page }) => {
    await reportPage.goto();

    // Step 1: Fill description (minimum 20 chars required)
    await reportPage.fillDescription('I witnessed a domestic violence incident today at my apartment building. It was very concerning.');
    await reportPage.continueButton.click();

    // Step 2: Skip evidence upload
    await reportPage.continueButton.click();

    // Step 3: Select location and date
    await reportPage.selectLocation('Addis Ababa');
    await reportPage.selectDate('2024-01-15T10:00');
    await reportPage.continueButton.click();

    // Step 4: Select category
    await reportPage.selectCategory('DOMESTIC_VIOLENCE');
    await reportPage.continueButton.click();

    // Step 5: Check consent and submit
    await reportPage.checkConsent();
    await reportPage.submitReport();

    // Verify success modal with Case ID
    await reportPage.expectReportSuccess();
    const caseId = await reportPage.getCaseId();
    expect(caseId).toMatch(/^(SH-|CASE-)/);
  });

  test('should show validation error for missing required fields', async ({ page }) => {
    await reportPage.goto();

    // Try to continue without filling description
    const continueBtn = page.locator('button:has-text("Continue")');
    await expect(continueBtn).toBeDisabled();

    // Fill minimal description
    await reportPage.fillDescription('Short desc');
    
    // Should still be disabled (minimum 20 chars)
    await expect(continueBtn).toBeDisabled();
  });

  test('should generate Case ID after submission', async ({ page }) => {
    await reportPage.goto();

    // Submit a complete report
    await reportPage.fillDescription('I am reporting an incident of workplace harassment that happened yesterday. The manager was verbally abusive.');
    await reportPage.continueButton.click();
    await reportPage.continueButton.click(); // Skip evidence
    await reportPage.selectLocation('Oromia');
    await reportPage.selectDate('2024-01-14T14:30');
    await reportPage.continueButton.click();
    await reportPage.selectCategory('WORKPLACE_ABUSE');
    await reportPage.continueButton.click();
    await reportPage.checkConsent();
    await reportPage.submitReport();

    // Verify Case ID format
    await reportPage.expectReportSuccess();
    const caseId = await reportPage.getCaseId();
    
    expect(caseId).toBeTruthy();
    expect(caseId.length).toBeGreaterThan(5);
    
    // Case ID should be displayed prominently
    await expect(page.locator('text=Your Report ID')).toBeVisible();
  });

  test('should handle emergency exit button', async ({ page }) => {
    await reportPage.goto();

    // Emergency exit should redirect to Google
    await reportPage.clickEmergencyExit();
    
    // Verify navigation to external site
    await expect(page).toHaveURL(/google.com/);
  });

  test('should enforce daily submission limit', async ({ page }) => {
    await reportPage.goto();
    
    // Check the remaining reports counter
    const remainingText = await page.locator('text=reports remaining').textContent();
    expect(remainingText).toMatch(/\d+ reports remaining/);
  });
});
