import AxeBuilder from '@axe-core/playwright';
import { test, expect } from '../fixtures';

// Automated checks catch roughly a third of accessibility issues; they complement, not replace, manual review.
const scan = (page: import('@playwright/test').Page) =>
  new AxeBuilder({ page }).withTags(['wcag2a', 'wcag2aa', 'wcag21a', 'wcag21aa']).analyze();

test.describe('Accessibility (axe-core)', () => {
  test('login page has no WCAG A/AA violations @regression', async ({ loginPage, page }) => {
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();
    expect((await scan(page)).violations).toEqual([]);
  });

  test('employees page has no WCAG A/AA violations @regression', async ({ authedPage, employeesPage, page }) => {
    await employeesPage.goto();
    await expect(employeesPage.rows).not.toHaveCount(0);
    expect((await scan(page)).violations).toEqual([]);
  });

  test('add-employee form shows accessible errors @regression', async ({ authedPage, addEmployeePage, page }) => {
    await addEmployeePage.goto();
    await addEmployeePage.submit.click(); // scan the error state too
    await addEmployeePage.expectFieldError('firstName', 'First name is required');
    expect((await scan(page)).violations).toEqual([]);
  });
});
