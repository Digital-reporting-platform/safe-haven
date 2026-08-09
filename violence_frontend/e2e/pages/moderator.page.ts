import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class ModeratorPage extends BasePage {
  readonly contentQueue: Locator;
  readonly postCard: Locator;
  readonly approveButton: Locator;
  readonly rejectButton: Locator;
  readonly contentPreview: Locator;
  readonly flagReason: Locator;
  readonly filterTabs: Locator;
  readonly moderationHistory: Locator;
  readonly bulkActionSelect: Locator;
  readonly contentStatus: Locator;

  constructor(page: Page) {
    super(page);
    this.contentQueue = page.locator('[data-testid="content-queue"], .moderation-queue');
    this.postCard = page.locator('.post-card, [data-testid="post-card"]');
    this.approveButton = page.locator('button:has-text("Approve"), button[title="Approve"]');
    this.rejectButton = page.locator('button:has-text("Reject"), button[title="Reject"]');
    this.contentPreview = page.locator('.content-preview, [data-testid="content-preview"]');
    this.flagReason = page.locator('.flag-reason, [data-testid="flag-reason"]');
    this.filterTabs = page.locator('.filter-tabs, [role="tablist"]');
    this.moderationHistory = page.locator('.moderation-history, [data-testid="history"]');
    this.bulkActionSelect = page.locator('select[name="bulkAction"]');
    this.contentStatus = page.locator('.content-status, [data-testid="status"]');
  }

  async goto() {
    await this.page.goto('/moderator/dashboard');
    await this.waitForLoad();
  }

  async expectModeratorDashboardLoaded() {
    await expect(this.contentQueue).toBeVisible({ timeout: 10000 });
  }

  async getPendingCount(): Promise<number> {
    return await this.postCard.count();
  }

  async approvePost(postId: string) {
    const post = this.page.locator(`[data-post-id="${postId}"]`);
    await post.locator(this.approveButton).click();
  }

  async rejectPost(postId: string, reason?: string) {
    const post = this.page.locator(`[data-post-id="${postId}"]`);
    await post.locator(this.rejectButton).click();
    if (reason) {
      await this.page.locator('textarea[name="reason"]').fill(reason);
      await this.page.locator('button:has-text("Confirm Rejection")').click();
    }
  }

  async switchTab(tabName: 'pending' | 'approved' | 'rejected' | 'all') {
    await this.page.locator(`button:has-text("${tabName}")`).click();
    await this.page.waitForTimeout(500);
  }

  async expectPostApproved(postId: string) {
    await this.switchTab('approved');
    await expect(this.page.locator(`[data-post-id="${postId}"]`)).toBeVisible();
  }

  async expectPostRejected(postId: string) {
    await this.switchTab('rejected');
    await expect(this.page.locator(`[data-post-id="${postId}"]`)).toBeVisible();
  }

  async verifyPostNotPubliclyVisible(publicPage: Page, postId: string) {
    await publicPage.goto('/community');
    await publicPage.waitForLoadState('networkidle');
    await expect(publicPage.locator(`[data-post-id="${postId}"]`)).not.toBeVisible();
  }

  async viewModerationHistory() {
    await this.page.locator('button:has-text("History"), a:has-text("History")').click();
  }

  async performBulkAction(action: 'approve' | 'reject', postIds: string[]) {
    for (const postId of postIds) {
      await this.page.locator(`[data-post-id="${postId}"] input[type="checkbox"]`).check();
    }
    await this.bulkActionSelect.selectOption(action);
    await this.page.locator('button:has-text("Apply")').click();
  }
}
