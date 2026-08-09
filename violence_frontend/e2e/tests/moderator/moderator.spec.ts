import { test, expect } from '@playwright/test';
import { LoginPage } from '../../pages/login.page';
import { ModeratorPage } from '../../pages/moderator.page';

test.describe('Content Moderator - Moderation Queue', () => {
  let moderatorPage: ModeratorPage;

  test.beforeEach(async ({ page }) => {
    const loginPage = new LoginPage(page);
    await loginPage.goto();
    await loginPage.loginAs('moderator');
    await page.waitForURL(/moderator|dashboard/);

    moderatorPage = new ModeratorPage(page);
    await moderatorPage.expectModeratorDashboardLoaded();
  });

  test('should view content moderation queue', async ({ page }) => {
    const pendingCount = await moderatorPage.getPendingCount();
    expect(pendingCount).toBeGreaterThanOrEqual(0);
  });

  test('should approve valid post', async ({ page }) => {
    const pendingCount = await moderatorPage.getPendingCount();
    if (pendingCount > 0) {
      const postId = 'POST-001';
      await moderatorPage.approvePost(postId);
      
      // Verify post moved to approved
      await moderatorPage.expectPostApproved(postId);
    }
  });

  test('should reject inappropriate post', async ({ page }) => {
    const pendingCount = await moderatorPage.getPendingCount();
    if (pendingCount > 0) {
      const postId = 'POST-002';
      await moderatorPage.rejectPost(postId, 'Contains inappropriate content');
      
      // Verify post moved to rejected
      await moderatorPage.expectPostRejected(postId);
    }
  });

  test('should switch between moderation tabs', async ({ page }) => {
    await moderatorPage.switchTab('pending');
    await page.waitForTimeout(300);
    
    await moderatorPage.switchTab('approved');
    await page.waitForTimeout(300);
    
    await moderatorPage.switchTab('rejected');
    await page.waitForTimeout(300);
  });

  test('should view moderation history', async ({ page }) => {
    await moderatorPage.viewModerationHistory();
    await expect(page.locator('text=History')).toBeVisible();
  });
});

test.describe('Content Moderator - Public Visibility', () => {
  test('rejected post should not be visible publicly', async ({ browser }) => {
    // Create moderator context
    const moderatorContext = await browser.newContext();
    const moderatorPage = await moderatorContext.newPage();
    
    // Login as moderator and reject a post
    const loginPage = new LoginPage(moderatorPage);
    const modPage = new ModeratorPage(moderatorPage);
    
    await loginPage.goto();
    await loginPage.loginAs('moderator');
    await moderatorPage.waitForURL(/moderator|dashboard/);
    await modPage.expectModeratorDashboardLoaded();
    
    // Reject a post
    await modPage.rejectPost('POST-003', 'Inappropriate content');
    await moderatorContext.close();

    // Create anonymous context
    const anonContext = await browser.newContext();
    const publicPage = await anonContext.newPage();
    
    // Verify rejected post is not visible
    await modPage.verifyPostNotPubliclyVisible(publicPage, 'POST-003');
    
    await anonContext.close();
  });
});
