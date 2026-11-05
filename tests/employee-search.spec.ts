import { test, expect } from '../fixtures';
import { readJson } from '../utils/data';

const { searchCases } = readJson<{ searchCases: { term: string; expected: string[] }[] }>('employees.json');

test.describe('Employee search', () => {
  test.beforeEach(async ({ authedPage, employeesPage }) => {
    await employeesPage.goto();
  });

  // Data-driven from JSON: one test per row.
  for (const { term, expected } of searchCases) {
    test(`search "${term}" returns ${expected.length} result(s) @regression`, async ({ employeesPage }) => {
      await employeesPage.searchFor(term);
      await employeesPage.expectNames(expected);
      if (expected.length === 0) await expect(employeesPage.emptyState).toBeVisible();
      else await expect(employeesPage.emptyState).toBeHidden();
    });
  }

  test('clearing the search restores the full list @regression', async ({ employeesPage }) => {
    // Other tests add employees in parallel, so don't assert an exact total.
    await employeesPage.searchFor('carla');
    await employeesPage.expectNames(['Carla Chen']);
    await employeesPage.searchFor('');
    await expect(employeesPage.rows.locator('td:first-child').filter({ hasText: 'Alice Anderson' })).toHaveCount(1);
    expect(await employeesPage.rows.count()).toBeGreaterThanOrEqual(5);
    await expect(employeesPage.resultCount).toHaveText(/\d+ employee\(s\) found/);
  });
});
