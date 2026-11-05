import { test, expect } from '../fixtures';
import { readCsv, readJson, uniqueId } from '../utils/data';

// Pattern: read data at module load, then generate one test per row.
// A failing row is reported by name, so it is easy to triage.

test.describe('Data-driven: invalid logins (JSON)', () => {
  const { invalid } = readJson<{ invalid: { title: string; email: string; password: string; error: string }[] }>('users.json');

  for (const row of invalid) {
    test(`rejects ${row.title} @regression`, async ({ loginPage }) => {
      await loginPage.goto();
      await loginPage.login(row.email, row.password);
      await loginPage.expectFormError(row.error);
      await loginPage.expectOnPage();
    });
  }
});

test.describe('Data-driven: form validation (CSV)', () => {
  for (const row of readCsv('validation-cases.csv')) {
    test(`validation: ${row.case} @regression`, async ({ authedPage, addEmployeePage }) => {
      await addEmployeePage.goto();
      await addEmployeePage.add({
        firstName: row.firstName, lastName: row.lastName, email: row.email,
        department: row.department, salary: row.salary,
      });
      await addEmployeePage.expectFieldError(row.field, row.message);
      await expect(addEmployeePage.success).toBeHidden();
    });
  }
});

test.describe('Data-driven: add employees (CSV)', () => {
  for (const row of readCsv('employees.csv')) {
    test(`adds ${row.firstName} ${row.lastName} @regression`, async ({ authedPage, addEmployeePage, employeesPage }) => {
      const email = `${uniqueId(row.firstName.toLowerCase())}@example.test`;
      await addEmployeePage.goto();
      await addEmployeePage.add({ ...row, email } as never);
      await expect(addEmployeePage.success).toContainText(`${row.firstName} ${row.lastName}`);

      await employeesPage.goto();
      await employeesPage.searchFor(email);
      await employeesPage.expectNames([`${row.firstName} ${row.lastName}`]);
    });
  }
});
