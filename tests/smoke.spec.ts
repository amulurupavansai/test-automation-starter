import { test, expect } from '../fixtures';

// Fast checks that the app is up and the main journey works. Run with: npm run test:smoke
test.describe('Smoke', () => {
  test('login page loads and API is healthy @smoke', async ({ loginPage, request }) => {
    await loginPage.goto();
    await expect(loginPage.heading).toBeVisible();
    await expect(loginPage.submit).toBeEnabled();
    const health = await request.get('/api/health');
    expect(health.ok()).toBeTruthy();
  });

  test('authenticated user can open employees and payslip pages @smoke', async ({ authedPage, employeesPage, payslipPage }) => {
    await employeesPage.goto();
    await expect(employeesPage.heading).toBeVisible();
    await expect(employeesPage.rows).not.toHaveCount(0);

    await payslipPage.goto();
    await expect(payslipPage.heading).toBeVisible();
    await expect(payslipPage.netPay).toBeVisible();
  });
});
