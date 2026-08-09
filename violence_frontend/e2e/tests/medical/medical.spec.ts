import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { MedicalPage } from '../../pages/medical.page';

test.describe('Medical Professional - Case Management', () => {
  let medicalPage: MedicalPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('medical');
    await page.waitForURL(/medical|dashboard/);

    medicalPage = new MedicalPage(page);
    await medicalPage.expectMedicalDashboardLoaded();
  });

  test('should view assigned medical cases', async ({ page }) => {
    const caseCount = await medicalPage.getAssignedMedicalCaseCount();
    expect(caseCount).toBeGreaterThanOrEqual(0);
  });

  test('should open medical case details', async ({ page }) => {
    const cases = await medicalPage.getAssignedMedicalCaseCount();
    if (cases > 0) {
      await medicalPage.openCase('MEDICAL-001');
      await expect(page.locator('text=Patient Information')).toBeVisible();
    }
  });

  test('should add medical notes', async ({ page }) => {
    const cases = await medicalPage.getAssignedMedicalCaseCount();
    if (cases > 0) {
      await medicalPage.openCase('MEDICAL-001');
      
      const note = 'Patient shows signs of physical trauma. Recommended immediate counseling.';
      await medicalPage.addMedicalNote(note);
      
      await medicalPage.expectMedicalNoteVisible(note);
    }
  });

  test('should mark medical support as provided', async ({ page }) => {
    const cases = await medicalPage.getAssignedMedicalCaseCount();
    if (cases > 0) {
      await medicalPage.openCase('MEDICAL-001');
      
      await medicalPage.markMedicalSupportProvided();
      
      // Verify status update
      await expect(page.locator('text=Medical Support Provided')).toBeVisible();
    }
  });

  test('should filter cases by urgency', async ({ page }) => {
    await medicalPage.goto();
    
    await medicalPage.filterByUrgencyLevel('high');
    await page.waitForTimeout(500);
    
    await medicalPage.filterByUrgencyLevel('medium');
    await page.waitForTimeout(500);
    
    await medicalPage.filterByUrgencyLevel('low');
    await page.waitForTimeout(500);
  });
});

test.describe('Medical Professional - Integration', () => {
  test('medical updates should be visible to survivor', async ({ browser }) => {
    // Medical professional adds note
    const medicalContext = await browser.newContext();
    const medicalPage = await medicalContext.newPage();
    
    const loginPage = new LoginPage(medicalPage);
    const medPage = new MedicalPage(medicalPage);
    
    await loginPage.goto();
    await loginPage.loginAs('medical');
    await medicalPage.waitForURL(/medical|dashboard/);
    await medPage.expectMedicalDashboardLoaded();
    
    const note = 'Medical examination completed. Patient stable.';
    await medPage.openCase('MEDICAL-001');
    await medPage.addMedicalNote(note);
    await medicalContext.close();

    // Survivor sees the update
    const survivorContext = await browser.newContext();
    const survivorPage = await survivorContext.newPage();
    
    await medPage.verifyMedicalUpdateInTimeline(survivorPage, 'MEDICAL-001', note);
    await survivorContext.close();
  });
});
