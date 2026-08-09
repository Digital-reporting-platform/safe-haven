import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class DashboardPage extends BasePage {
  readonly welcomeMessage: Locator;
  readonly casesList: Locator;
  readonly caseItems: Locator;
  readonly statusBadge: Locator;
  readonly newReportButton: Locator;
  readonly profileLink: Locator;
  readonly logoutButton: Locator;
  readonly caseCount: Locator;
  readonly recentActivity: Locator;

  constructor(page: Page) {
    super(page);
    this.welcomeMessage = page.locator('text=/Welcome back|Welcome/');
    this.casesList = page.locator('[data-testid="cases-list"], .cases-list');
    this.caseItems = page.locator('[data-testid="case-item"], .case-card');
    this.statusBadge = page.locator('.status-badge, [data-testid="status"]');
    this.newReportButton = page.locator('a[href="/report"], button:has-text("New Report")');
    this.profileLink = page.locator('a[href*="/settings"], button:has-text("Profile")');
    this.logoutButton = page.locator('button:has-text("Logout"), a:has-text("Logout")');
    this.caseCount = page.locator('[data-testid="case-count"], .case-count');
    this.recentActivity = page.locator('[data-testid="recent-activity"], .activity-feed');
  }

  async expectDashboardLoaded() {
    await expect(this.welcomeMessage).toBeVisible({ timeout: 10000 });
  }

  async getCaseCount(): Promise<number> {
    const count = await this.caseItems.count();
    return count;
  }

  async openCase(caseId: string) {
    await this.page.locator(`a[href*="${caseId}"], [data-case-id="${caseId}"]`).click();
  }

  async expectCaseVisible(caseId: string) {
    await expect(this.page.locator(`text=${caseId}`)).toBeVisible();
  }

  async expectStatus(status: string) {
    await expect(this.statusBadge.filter({ hasText: status })).toBeVisible();
  }

  async clickNewReport() {
    await this.newReportButton.click();
  }

  async logout() {
    await this.logoutButton.click();
  }

  async getRecentActivity(): Promise<string[]> {
    const activities = await this.recentActivity.locator('li, .activity-item').allTextContents();
    return activities;
  }
}
