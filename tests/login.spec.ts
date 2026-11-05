import { test, expect } from '../fixtures';
import { credentials } from '../config/environments';

test.describe('Login', () => {
  test.beforeEach(async ({ loginPage }) => {
    await loginPage.goto();
  });

  test('valid credentials open the employee list @smoke @regression', async ({ loginPage, employeesPage }) => {
    await loginPage.login(credentials.email, credentials.password);
    await employeesPage.expectOnPage();
    await expect(employeesPage.heading).toBeVisible();
  });

  test('empty form shows required-field messages @regression', async ({ loginPage }) => {
    await loginPage.submit.click();
    await expect(loginPage.emailError).toHaveText('Email is required');
    await expect(loginPage.passwordError).toHaveText('Password is required');
    await loginPage.expectOnPage();
  });

  test('logout returns to the login page @regression', async ({ loginPage, employeesPage }) => {
    await loginPage.login(credentials.email, credentials.password);
    await employeesPage.expectOnPage();
    await employeesPage.logout();
    await loginPage.expectOnPage();
  });

  test('protected pages redirect anonymous users to login @regression', async ({ page, loginPage }) => {
    await page.goto('/payslip.html');
    await loginPage.expectOnPage();
  });
});
