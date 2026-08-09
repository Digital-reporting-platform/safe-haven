import { Page, Locator, expect } from '@playwright/test';
import { BasePage } from './base.page';

export class RegisterPage extends BasePage {
  readonly firstNameInput: Locator;
  readonly lastNameInput: Locator;
  readonly emailInput: Locator;
  readonly phoneInput: Locator;
  readonly passwordInput: Locator;
  readonly confirmPasswordInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly loginLink: Locator;

  constructor(page: Page) {
    super(page);
    this.firstNameInput = page.locator('#firstName');
    this.lastNameInput = page.locator('#lastName');
    this.emailInput = page.locator('#email');
    this.phoneInput = page.locator('#phone');
    this.passwordInput = page.locator('#password');
    this.confirmPasswordInput = page.locator('#confirmPassword');
    this.submitButton = page.locator('button[type="submit"]');
    this.errorMessage = page.locator('.text-red-500');
    this.loginLink = page.locator('a[href="/auth/login"]');
  }

  async goto() {
    await this.page.goto('/auth/register');
    await this.waitForLoad();
  }

  async register(data: {
    firstName: string;
    lastName: string;
    email: string;
    phone: string;
    password: string;
    confirmPassword: string;
  }) {
    await this.firstNameInput.fill(data.firstName);
    await this.lastNameInput.fill(data.lastName);
    await this.emailInput.fill(data.email);
    await this.phoneInput.fill(data.phone);
    await this.passwordInput.fill(data.password);
    await this.confirmPasswordInput.fill(data.confirmPassword);
    await this.submitButton.click();
  }

  async expectRegistrationSuccess() {
    await expect(this.page).toHaveURL(/verify-email|login/);
  }

  async expectRegistrationError(message?: string) {
    if (message) {
      await expect(this.page.getByText(message)).toBeVisible();
    } else {
      await expect(this.errorMessage.first()).toBeVisible();
    }
  }
}
