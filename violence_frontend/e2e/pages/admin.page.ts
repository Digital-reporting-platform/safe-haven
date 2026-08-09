import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class AdminPage extends BasePage {
  readonly usersList: Locator;
  readonly reportsList: Locator;
  readonly analyticsSection: Locator;
  readonly assignCaseButton: Locator;
  readonly roleSelect: Locator;
  readonly statusFilter: Locator;
  readonly searchInput: Locator;
  readonly userRow: Locator;
  readonly reportRow: Locator;
  readonly caseManagerSelect: Locator;
  readonly generateReportButton: Locator;
  readonly statsCards: Locator;

  constructor(page: Page) {
    super(page);
    this.usersList = page.locator('[data-testid="users-list"], .users-table');
    this.reportsList = page.locator('[data-testid="reports-list"], .reports-table');
    this.analyticsSection = page.locator('[data-testid="analytics"], .analytics-section');
    this.assignCaseButton = page.locator('button:has-text("Assign")');
    this.roleSelect = page.locator('select[name="role"]');
    this.statusFilter = page.locator('select[name="status"]');
    this.searchInput = page.locator('input[type="search"], input[placeholder*="Search"]');
    this.userRow = page.locator('tr[data-user-id], .user-row');
    this.reportRow = page.locator('tr[data-report-id], .report-row');
    this.caseManagerSelect = page.locator('select[name="caseManager"]');
    this.generateReportButton = page.locator('button:has-text("Generate Report")');
    this.statsCards = page.locator('.stat-card, [data-testid="stat-card"]');
  }

  async goto() {
    await this.page.goto('/admin');
    await this.waitForLoad();
  }

  async expectAdminDashboardLoaded() {
    await expect(this.usersList.or(this.reportsList).or(this.analyticsSection)).toBeVisible({ timeout: 10000 });
  }

  async searchUsers(query: string) {
    await this.searchInput.fill(query);
    await this.page.waitForTimeout(500);
  }

  async filterByStatus(status: string) {
    await this.statusFilter.selectOption(status);
    await this.page.waitForTimeout(500);
  }

  async assignCaseToManager(caseId: string, managerName: string) {
    const row = this.page.locator(`tr:has-text("${caseId}")`);
    await row.locator(this.assignCaseButton).click();
    await this.caseManagerSelect.selectOption({ label: managerName });
    await this.page.locator('button:has-text("Confirm")').click();
  }

  async changeUserRole(userId: string, newRole: string) {
    const row = this.page.locator(`tr[data-user-id="${userId}"]`);
    await row.locator(this.roleSelect).selectOption(newRole);
  }

  async getReportCount(): Promise<number> {
    return await this.reportRow.count();
  }

  async getUserCount(): Promise<number> {
    return await this.userRow.count();
  }

  async generateAnalyticsReport() {
    await this.generateReportButton.click();
    await this.page.waitForSelector('text=Report generated', { timeout: 5000 });
  }

  async expectStatsVisible() {
    await expect(this.statsCards.first()).toBeVisible();
  }

  async viewAllReports() {
    await this.page.locator('a:has-text("All Reports"), button:has-text("View All")').click();
  }

  async viewUserManagement() {
    await this.page.locator('a:has-text("Users"), button:has-text("Manage Users")').click();
  }

  async expectCaseVisible(caseId: string) {
    await expect(this.page.locator(`text=${caseId}`).first()).toBeVisible();
  }
}
