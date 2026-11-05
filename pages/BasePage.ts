import { Page, expect } from '@playwright/test';

/** Shared behaviour for all page objects. Keep locators in the subclasses. */
export abstract class BasePage {
  constructor(protected readonly page: Page) {}

  /** Path (relative to baseURL) of the page, e.g. "/employees.html". */
  abstract readonly path: string;

  async goto(): Promise<void> {
    await this.page.goto(this.path);
  }

  async expectOnPage(): Promise<void> {
    await expect(this.page).toHaveURL(new RegExp(this.path.replace('.', '\\.') + '$'));
  }

  async logout(): Promise<void> {
    await this.page.getByRole('button', { name: 'Log out' }).click();
  }
}
