import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export class EmployeesPage extends BasePage {
  readonly path = '/employees.html';
  readonly heading: Locator;
  readonly search: Locator;
  readonly rows: Locator;
  readonly resultCount: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Employees' });
    this.search = page.getByLabel('Search employees');
    this.rows = page.locator('#employee-rows tr');
    this.resultCount = page.locator('#result-count');
    this.emptyState = page.locator('#empty-state');
  }

  async searchFor(term: string): Promise<void> {
    await this.search.fill(term);
  }

  /** Names shown in the first column, in display order. */
  async names(): Promise<string[]> {
    return this.rows.locator('td:first-child').allInnerTexts();
  }

  async expectNames(expected: string[]): Promise<void> {
    // toHaveText on a locator list retries until the table settles (no fixed sleeps).
    await expect(this.rows.locator('td:first-child')).toHaveText(expected);
  }
}
