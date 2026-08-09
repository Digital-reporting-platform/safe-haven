import { test as base, Page, BrowserContext, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ENV } from '../env';

// Define the type for user roles
type UserRole = 'admin' | 'survivor' | 'caseManager' | 'moderator' | 'medical' | 'legal';

// Storage state paths for each role
const STORAGE_STATE = {
  admin: './e2e/.auth/admin.json',
  survivor: './e2e/.auth/survivor.json',
  caseManager: './e2e/.auth/caseManager.json',
  moderator: './e2e/.auth/moderator.json',
  medical: './e2e/.auth/medical.json',
  legal: './e2e/.auth/legal.json',
};

// Extend the base test with custom fixtures
type Fixtures = {
  loginPage: LoginPage;
  adminPage: Page;
  survivorPage: Page;
  caseManagerPage: Page;
  moderatorPage: Page;
  medicalPage: Page;
  legalPage: Page;
};

export const test = base.extend<Fixtures>({
  // Login page fixture - always available
  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  // Admin authenticated page
  adminPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.admin });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Survivor authenticated page
  survivorPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.survivor });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Case Manager authenticated page
  caseManagerPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.caseManager });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Moderator authenticated page
  moderatorPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.moderator });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Medical authenticated page
  medicalPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.medical });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },

  // Legal authenticated page
  legalPage: async ({ browser }, use) => {
    const context = await browser.newContext({ storageState: STORAGE_STATE.legal });
    const page = await context.newPage();
    await use(page);
    await context.close();
  },
});

export { expect } from '@playwright/test';

// Helper function to authenticate and save storage state
export async function authenticateAndSaveState(
  browser: any,
  role: UserRole
): Promise<void> {
  const context = await browser.newContext();
  const page = await context.newPage();
  const loginPage = new LoginPage(page);

  await loginPage.goto();
  await loginPage.loginAs(role);
  
  // Wait for navigation to dashboard
  await page.waitForURL(/dashboard|admin|moderator/, { timeout: 10000 });

  // Save storage state
  await context.storageState({ path: STORAGE_STATE[role] });
  await context.close();
}

// Storage state paths export for reference
export { STORAGE_STATE };
