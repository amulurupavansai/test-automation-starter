import { Locator, Page, expect } from '@playwright/test';
import { BasePage } from './BasePage';

export interface EmployeeInput {
  firstName: string;
  lastName: string;
  email: string;
  department: string;
  salary: string;
}

export class AddEmployeePage extends BasePage {
  readonly path = '/add-employee.html';
  readonly submit: Locator;
  readonly success: Locator;

  constructor(page: Page) {
    super(page);
    this.submit = page.getByRole('button', { name: 'Add employee' });
    this.success = page.locator('#form-success');
  }

  async fill(e: EmployeeInput): Promise<void> {
    await this.page.getByLabel('First name').fill(e.firstName);
    await this.page.getByLabel('Last name').fill(e.lastName);
    await this.page.getByLabel('Email').fill(e.email);
    // Empty string => leave the placeholder option selected.
    await this.page.getByLabel('Department').selectOption(e.department || { index: 0 });
    await this.page.getByLabel('Annual salary').fill(e.salary);
  }

  async add(e: EmployeeInput): Promise<void> {
    await this.fill(e);
    await this.submit.click();
  }

  fieldError(field: string): Locator {
    return this.page.locator(`#${field}-error`);
  }

  async expectFieldError(field: string, message: string): Promise<void> {
    await expect(this.fieldError(field)).toHaveText(message);
  }
}
