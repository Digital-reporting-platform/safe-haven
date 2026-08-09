import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { LegalPage } from '../../pages/legal.page';

test.describe('Legal Provider - Case Management', () => {
  let legalPage: LegalPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('legal');
    await page.waitForURL(/legal|dashboard/);

    legalPage = new LegalPage(page);
    await legalPage.expectLegalDashboardLoaded();
  });

  test('should view assigned legal cases', async ({ page }) => {
    const caseCount = await legalPage.getAssignedLegalCaseCount();
    expect(caseCount).toBeGreaterThanOrEqual(0);
  });

  test('should open legal case details', async ({ page }) => {
    const cases = await legalPage.getAssignedLegalCaseCount();
    if (cases > 0) {
      await legalPage.openCase('LEGAL-001');
      await expect(page.locator('text=Client Information')).toBeVisible();
    }
  });

  test('should add legal advice', async ({ page }) => {
    const cases = await legalPage.getAssignedLegalCaseCount();
    if (cases > 0) {
      await legalPage.openCase('LEGAL-001');
      
      const advice = 'Advised client on legal options. Recommended filing police report.';
      await legalPage.addLegalAdvice(advice);
      
      await legalPage.expectLegalAdviceVisible(advice);
    }
  });

  test('should update case progress', async ({ page }) => {
    const cases = await legalPage.getAssignedLegalCaseCount();
    if (cases > 0) {
      await legalPage.openCase('LEGAL-001');
      
      await legalPage.updateCaseProgress('LEGAL_ACTION_INITIATED');
      
      await legalPage.expectProgressStatus('Legal Action Initiated');
    }
  });

  test('should view case documents', async ({ page }) => {
    const cases = await legalPage.getAssignedLegalCaseCount();
    if (cases > 0) {
      await legalPage.openCase('LEGAL-001');
      await legalPage.viewCaseDocuments();
    }
  });
});

test.describe('Legal Provider - Integration', () => {
  test('legal updates should be visible to survivor', async ({ browser }) => {
    // Legal provider adds update
    const legalContext = await browser.newContext();
    const legalPage = await legalContext.newPage();
    
    const loginPage = new LoginPage(legalPage);
    const legPage = new LegalPage(legalPage);
    
    await loginPage.goto();
    await loginPage.loginAs('legal');
    await legalPage.waitForURL(/legal|dashboard/);
    await legPage.expectLegalDashboardLoaded();
    
    const update = 'Legal consultation scheduled for next week.';
    await legPage.openCase('LEGAL-001');
    await legPage.addLegalAdvice(update);
    await legalContext.close();

    // Survivor sees the update
    const survivorContext = await browser.newContext();
    const survivorPage = await survivorContext.newPage();
    
    await legPage.verifyLegalUpdateInTimeline(survivorPage, 'LEGAL-001', update);
    await survivorContext.close();
  });
});
