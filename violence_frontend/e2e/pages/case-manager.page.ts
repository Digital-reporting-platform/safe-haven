import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class CaseManagerPage extends BasePage {
  readonly assignedCasesList: Locator;
  readonly caseCard: Locator;
  readonly statusUpdateSelect: Locator;
  readonly addNoteButton: Locator;
  readonly noteTextarea: Locator;
  readonly saveNoteButton: Locator;
  readonly caseDetails: Locator;
  readonly survivorInfo: Locator;
  readonly caseHistory: Locator;
  readonly filterSelect: Locator;
  readonly priorityBadge: Locator;
  readonly openCaseButton: Locator;

  constructor(page: Page) {
    super(page);
    this.assignedCasesList = page.locator('[data-testid="assigned-cases"], .cases-list');
    this.caseCard = page.locator('.case-card, [data-testid="case-card"]');
    this.statusUpdateSelect = page.locator('select[name="status"], select[name="caseStatus"]');
    this.addNoteButton = page.locator('button:has-text("Add Note"), button:has-text("New Note")');
    this.noteTextarea = page.locator('textarea[placeholder*="note"], textarea[name="note"]');
    this.saveNoteButton = page.locator('button:has-text("Save Note"), button:has-text("Post")');
    this.caseDetails = page.locator('.case-details, [data-testid="case-details"]');
    this.survivorInfo = page.locator('.survivor-info, [data-testid="survivor-info"]');
    this.caseHistory = page.locator('.case-history, [data-testid="case-history"]');
    this.filterSelect = page.locator('select[name="filter"]');
    this.priorityBadge = page.locator('.priority-badge, [data-testid="priority"]');
    this.openCaseButton = page.locator('button:has-text("Open Case"), button:has-text("View Details")');
  }

  async goto() {
    await this.page.goto('/counselor/dashboard');
    await this.waitForLoad();
  }

  async expectCaseManagerDashboardLoaded() {
    await expect(this.assignedCasesList).toBeVisible({ timeout: 10000 });
  }

  async getAssignedCaseCount(): Promise<number> {
    return await this.caseCard.count();
  }

  async openCase(caseId: string) {
    const caseCard = this.page.locator(`[data-case-id="${caseId}"]`);
    await caseCard.locator(this.openCaseButton).click();
  }

  async updateCaseStatus(status: 'UNDER_REVIEW' | 'IN_PROGRESS' | 'RESOLVED' | 'ESCALATED') {
    await this.statusUpdateSelect.selectOption(status);
    await this.page.locator('button:has-text("Update Status")').click();
  }

  async addNote(note: string) {
    await this.addNoteButton.click();
    await this.noteTextarea.fill(note);
    await this.saveNoteButton.click();
  }

  async expectNoteVisible(note: string) {
    await expect(this.page.locator(`text=${note}`)).toBeVisible();
  }

  async filterByStatus(status: string) {
    await this.filterSelect.selectOption(status);
    await this.page.waitForTimeout(500);
  }

  async expectCaseDetailsVisible() {
    await expect(this.caseDetails).toBeVisible();
  }

  async getCaseStatus(caseId: string): Promise<string> {
    const caseCard = this.page.locator(`[data-case-id="${caseId}"]`);
    return await caseCard.locator(this.statusUpdateSelect).inputValue();
  }

  async verifySurvivorCanSeeUpdates(survivorPage: Page, caseId: string, updateText: string) {
    await survivorPage.goto('/survivor/my-cases');
    await survivorPage.waitForLoadState('networkidle');
    await expect(survivorPage.locator(`text=${caseId}`)).toBeVisible();
    await expect(survivorPage.locator(`text=${updateText}`)).toBeVisible();
  }

  async expectCaseVisible(caseId: string) {
    await expect(this.page.locator(`text=${caseId}`).first()).toBeVisible();
  }
}
