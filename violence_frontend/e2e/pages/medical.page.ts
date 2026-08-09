import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class MedicalPage extends BasePage {
  readonly medicalCasesList: Locator;
  readonly caseCard: Locator;
  readonly addNoteButton: Locator;
  readonly medicalNoteTextarea: Locator;
  readonly saveNoteButton: Locator;
  readonly markSupportProvidedButton: Locator;
  readonly medicalHistory: Locator;
  readonly patientInfo: Locator;
  readonly urgencyBadge: Locator;
  readonly viewCaseButton: Locator;
  readonly filterByUrgency: Locator;

  constructor(page: Page) {
    super(page);
    this.medicalCasesList = page.locator('[data-testid="medical-cases"], .medical-cases');
    this.caseCard = page.locator('.case-card, [data-testid="case-card"]');
    this.addNoteButton = page.locator('button:has-text("Add Medical Note")');
    this.medicalNoteTextarea = page.locator('textarea[name="medicalNote"], textarea[placeholder*="medical"]');
    this.saveNoteButton = page.locator('button:has-text("Save")');
    this.markSupportProvidedButton = page.locator('button:has-text("Mark Support Provided")');
    this.medicalHistory = page.locator('.medical-history, [data-testid="medical-history"]');
    this.patientInfo = page.locator('.patient-info, [data-testid="patient-info"]');
    this.urgencyBadge = page.locator('.urgency-badge, [data-testid="urgency"]');
    this.viewCaseButton = page.locator('button:has-text("View Case"), button:has-text("Open")');
    this.filterByUrgency = page.locator('select[name="urgency"]');
  }

  async goto() {
    await this.page.goto('/medical-provider/dashboard');
    await this.waitForLoad();
  }

  async expectMedicalDashboardLoaded() {
    await expect(this.medicalCasesList).toBeVisible({ timeout: 10000 });
  }

  async getAssignedMedicalCaseCount(): Promise<number> {
    return await this.caseCard.count();
  }

  async openCase(caseId: string) {
    const caseCard = this.page.locator(`[data-case-id="${caseId}"]`);
    await caseCard.locator(this.viewCaseButton).click();
  }

  async addMedicalNote(note: string) {
    await this.addNoteButton.click();
    await this.medicalNoteTextarea.fill(note);
    await this.saveNoteButton.click();
  }

  async markMedicalSupportProvided() {
    await this.markSupportProvidedButton.click();
    await this.page.locator('button:has-text("Confirm")').click();
  }

  async expectMedicalNoteVisible(note: string) {
    await expect(this.page.locator(`text=${note}`)).toBeVisible();
  }

  async filterByUrgencyLevel(level: 'high' | 'medium' | 'low') {
    await this.filterByUrgency.selectOption(level);
    await this.page.waitForTimeout(500);
  }

  async expectUrgencyBadgeVisible(caseId: string) {
    const caseCard = this.page.locator(`[data-case-id="${caseId}"]`);
    await expect(caseCard.locator(this.urgencyBadge)).toBeVisible();
  }

  async verifyMedicalUpdateInTimeline(survivorPage: Page, caseId: string, note: string) {
    await survivorPage.goto(`/survivor/my-cases/${caseId}`);
    await survivorPage.waitForLoadState('networkidle');
    await expect(survivorPage.locator('.case-timeline, [data-testid="timeline"]')).toContainText(note);
  }
}
