import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';
import { ENV } from '../env';

export class LoginPage extends BasePage {
  // Selectors
  readonly emailInput: Locator;
  readonly passwordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly registerLink: Locator;
  readonly forgotPasswordLink: Locator;

  constructor(page: Page) {
    super(page);
    this.emailInput = page.locator('#email');
    this.passwordInput = page.locator('#password');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.text-red-500');
    this.registerLink = page.locator('a[href="/auth/register"]');
    this.forgotPasswordLink = page.locator('a[href="/auth/reset-password"]');
  }

  async goto() {
    await this.page.goto('/auth/login');
    await this.waitForLoad();
  }

  async login(email: string, password: string) {
    await this.emailInput.fill(email);
    await this.passwordInput.fill(password);
    await this.submitButton.click();
  }

  async loginAs(role: keyof typeof ENV.USERS) {
    const user = ENV.USERS[role];
    await this.login(user.email, user.password);
  }

  async expectLoginSuccess() {
    await expect(this.page).not.toHaveURL('/auth/login');
  }

  async expectLoginError(message?: string) {
    if (message) {
      await expect(this.page.getByText(message)).toBeVisible();
    } else {
      await expect(this.errorMessage.first()).toBeVisible();
    }
  }

  async clickRegister() {
    await this.registerLink.click();
  }

  async clickForgotPassword() {
    await this.forgotPasswordLink.click();
  }
}
