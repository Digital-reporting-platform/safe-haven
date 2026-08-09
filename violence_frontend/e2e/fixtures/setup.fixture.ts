import { test as setup, expect } from '@playwright/test';
import { LoginPage } from '../pages/login.page';
import { ENV } from '../env';

const adminFile = './e2e/.auth/admin.json';
const survivorFile = './e2e/.auth/survivor.json';
const caseManagerFile = './e2e/.auth/caseManager.json';
const moderatorFile = './e2e/.auth/moderator.json';
const medicalFile = './e2e/.auth/medical.json';
const legalFile = './e2e/.auth/legal.json';

// Global setup for all roles
setup('authenticate as admin', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAs('admin');
  await page.waitForURL(/admin|dashboard/, { timeout: 10000 });
  await page.context().storageState({ path: adminFile });
});

setup('authenticate as survivor', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAs('survivor');
  await page.waitForURL(/survivor|dashboard/, { timeout: 10000 });
  await page.context().storageState({ path: survivorFile });
});

setup('authenticate as case manager', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAs('caseManager');
  await page.waitForURL(/counselor|dashboard/, { timeout: 10000 });
  await page.context().storageState({ path: caseManagerFile });
});

setup('authenticate as moderator', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAs('moderator');
  await page.waitForURL(/moderator|dashboard/, { timeout: 10000 });
  await page.context().storageState({ path: moderatorFile });
});

setup('authenticate as medical professional', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAs('medical');
  await page.waitForURL(/medical|dashboard/, { timeout: 10000 });
  await page.context().storageState({ path: medicalFile });
});

setup('authenticate as legal provider', async ({ page }) => {
  const loginPage = new LoginPage(page);
  await loginPage.goto();
  await loginPage.loginAs('legal');
  await page.waitForURL(/legal|dashboard/, { timeout: 10000 });
  await page.context().storageState({ path: legalFile });
});
