import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class LegalPage extends BasePage {
  readonly legalCasesList: Locator;
  readonly caseCard: Locator;
  readonly addAdviceButton: Locator;
  readonly adviceTextarea: Locator;
  readonly saveAdviceButton: Locator;
  readonly updateProgressButton: Locator;
  readonly progressSelect: Locator;
  readonly caseDocuments: Locator;
  readonly clientInfo: Locator;
  readonly legalTimeline: Locator;
  readonly viewCaseButton: Locator;
  readonly caseStatus: Locator;

  constructor(page: Page) {
    super(page);
    this.legalCasesList = page.locator('[data-testid="legal-cases"], .legal-cases');
    this.caseCard = page.locator('.case-card, [data-testid="case-card"]');
    this.addAdviceButton = page.locator('button:has-text("Add Legal Advice")');
    this.adviceTextarea = page.locator('textarea[name="legalAdvice"], textarea[placeholder*="advice"]');
    this.saveAdviceButton = page.locator('button:has-text("Save Advice")');
    this.updateProgressButton = page.locator('button:has-text("Update Progress")');
    this.progressSelect = page.locator('select[name="progress"]');
    this.caseDocuments = page.locator('.case-documents, [data-testid="documents"]');
    this.clientInfo = page.locator('.client-info, [data-testid="client-info"]');
    this.legalTimeline = page.locator('.legal-timeline, [data-testid="legal-timeline"]');
    this.viewCaseButton = page.locator('button:has-text("View Case"), button:has-text("Open")');
    this.caseStatus = page.locator('.case-status, [data-testid="case-status"]');
  }

  async goto() {
    await this.page.goto('/legal/dashboard');
    await this.waitForLoad();
  }

  async expectLegalDashboardLoaded() {
    await expect(this.legalCasesList).toBeVisible({ timeout: 10000 });
  }

  async getAssignedLegalCaseCount(): Promise<number> {
    return await this.caseCard.count();
  }

  async openCase(caseId: string) {
    const caseCard = this.page.locator(`[data-case-id="${caseId}"]`);
    await caseCard.locator(this.viewCaseButton).click();
  }

  async addLegalAdvice(advice: string) {
    await this.addAdviceButton.click();
    await this.adviceTextarea.fill(advice);
    await this.saveAdviceButton.click();
  }

  async updateCaseProgress(progress: 'CONSULTATION' | 'EVIDENCE_GATHERING' | 'LEGAL_ACTION_INITIATED' | 'IN_PROGRESS' | 'RESOLVED') {
    await this.updateProgressButton.click();
    await this.progressSelect.selectOption(progress);
    await this.page.locator('button:has-text("Confirm")').click();
  }

  async expectLegalAdviceVisible(advice: string) {
    await expect(this.page.locator(`text=${advice}`)).toBeVisible();
  }

  async expectProgressStatus(status: string) {
    await expect(this.caseStatus.filter({ hasText: status })).toBeVisible();
  }

  async verifyLegalUpdateInTimeline(survivorPage: Page, caseId: string, update: string) {
    await survivorPage.goto(`/survivor/my-cases/${caseId}`);
    await survivorPage.waitForLoadState('networkidle');
    await expect(survivorPage.locator('.case-timeline, [data-testid="timeline"]')).toContainText(update);
  }

  async viewCaseDocuments() {
    await this.page.locator('button:has-text("Documents"), a:has-text("Documents")').click();
    await expect(this.caseDocuments).toBeVisible();
  }
}
