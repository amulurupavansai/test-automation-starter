import { test as base, expect, APIRequestContext } from '@playwright/test';
import { AddEmployeePage, EmployeesPage, LoginPage, PayslipPage } from '../pages';
import { credentials } from '../config/environments';

type Fixtures = {
  loginPage: LoginPage;
  employeesPage: EmployeesPage;
  addEmployeePage: AddEmployeePage;
  payslipPage: PayslipPage;
  /** Logs in through the API and pre-seeds the browser session (fast; use for non-login tests). */
  authedPage: void;
  /** API client with the auth header already set. */
  apiClient: APIRequestContext;
};

export const test = base.extend<Fixtures>({
  loginPage: async ({ page }, use) => use(new LoginPage(page)),
  employeesPage: async ({ page }, use) => use(new EmployeesPage(page)),
  addEmployeePage: async ({ page }, use) => use(new AddEmployeePage(page)),
  payslipPage: async ({ page }, use) => use(new PayslipPage(page)),

  authedPage: async ({ page, request }, use) => {
    const res = await request.post('/api/login', { data: credentials });
    expect(res.ok(), 'API login should succeed').toBeTruthy();
    const { token } = await res.json();
    await page.addInitScript((t) => window.localStorage.setItem('demo_token', t), token);
    await use();
  },

  apiClient: async ({ playwright, baseURL }, use) => {
    const anon = await playwright.request.newContext({ baseURL });
    const res = await anon.post('/api/login', { data: credentials });
    const { token } = await res.json();
    const client = await playwright.request.newContext({
      baseURL,
      extraHTTPHeaders: { Authorization: `Bearer ${token}` },
    });
    await use(client);
    await client.dispose();
    await anon.dispose();
  },
});

export { expect };
