import { Page, Locator, expect } from '@playwright/test';

export abstract class BasePage {
  constructor(protected page: Page) {}

  async goto(path: string) {
    await this.page.goto(path);
  }

  async waitForLoad() {
    await this.page.waitForLoadState('networkidle');
  }

  async expectUrlToContain(text: string) {
    await expect(this.page).toHaveURL(new RegExp(text));
  }

  async waitForToast(message: string) {
    await this.page.waitForSelector(`text=${message}`, { timeout: 5000 });
  }

  async takeScreenshot(name: string) {
    await this.page.screenshot({ path: `./test-results/screenshots/${name}.png` });
  }
}
