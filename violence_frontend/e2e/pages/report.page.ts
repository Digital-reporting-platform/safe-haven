import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ReportPage extends BasePage {
  readonly descriptionTextarea: Locator;
  readonly anonymousToggle: Locator;
  readonly continueButton: Locator;
  readonly submitButton: Locator;
  readonly caseIdDisplay: Locator;
  readonly progressBar: Locator;
  readonly stepIndicator: Locator;
  readonly evidenceUpload: Locator;
  readonly locationSelect: Locator;
  readonly dateInput: Locator;
  readonly categoryButtons: Locator;
  readonly consentCheckbox: Locator;
  readonly emergencyExitButton: Locator;

  constructor(page: Page) {
    super(page);
    this.descriptionTextarea = page.locator('textarea[placeholder*="story is safe"]');
    this.anonymousToggle = page.locator('[data-testid="anonymous-toggle"], button:has-text("Anonymous")');
    this.continueButton = page.locator('button:has-text("Continue")');
    this.submitButton = page.locator('button:has-text("Submit Secure Report")');
    this.caseIdDisplay = page.locator('.case-id, [data-testid="case-id"], .report-id');
    this.progressBar = page.locator('.h-3.w-full');
    this.stepIndicator = page.locator('text=Step');
    this.evidenceUpload = page.locator('input[type="file"]');
    this.locationSelect = page.locator('select');
    this.dateInput = page.locator('input[type="datetime-local"]');
    this.categoryButtons = page.locator('button[type="button"].flex-col');
    this.consentCheckbox = page.locator('input[type="checkbox"]');
    this.emergencyExitButton = page.locator('button:has-text("Emergency Exit")');
  }

  async goto() {
    await this.page.goto('/report');
    await this.waitForLoad();
  }

  async fillDescription(description: string) {
    await this.descriptionTextarea.fill(description);
  }

  async selectAnonymous(isAnonymous: boolean) {
    const toggle = this.page.locator('button', { hasText: isAnonymous ? 'Anonymous' : 'Verified' });
    await toggle.click();
  }

  async goToStep(step: number) {
    while (await this.stepIndicator.count() > 0) {
      const currentStep = await this.page.locator('text=Step').textContent();
      const current = parseInt(currentStep?.match(/\d+/)?.[0] || '0');
      if (current >= step) break;
      await this.continueButton.click({ force: true });
      await this.page.waitForTimeout(500);
    }
  }

  async clickContinue() {
    // Use force click to bypass animation overlays
    await this.continueButton.click({ force: true });
    // Wait for navigation/animation
    await this.page.waitForTimeout(300);
  }

  async selectLocation(location: string) {
    await this.locationSelect.selectOption(location);
  }

  async selectDate(date: string) {
    await this.dateInput.fill(date);
  }

  async selectCategory(category: string) {
    await this.page.locator(`button:has-text("${category}")`).click();
  }

  async uploadEvidence(filePath: string) {
    await this.evidenceUpload.setInputFiles(filePath);
  }

  async checkConsent() {
    await this.consentCheckbox.check();
  }

  async submitReport() {
    await this.submitButton.click();
  }

  async getCaseId(): Promise<string> {
    await expect(this.caseIdDisplay).toBeVisible();
    return await this.caseIdDisplay.textContent() || '';
  }

  async expectReportSuccess() {
    await expect(this.page.locator('text=Report Submitted')).toBeVisible({ timeout: 10000 });
  }

  async expectValidationError(field: string) {
    await expect(this.page.locator(`text=${field} is required`)).toBeVisible();
  }

  async clickEmergencyExit() {
    await this.emergencyExitButton.click();
  }
}
