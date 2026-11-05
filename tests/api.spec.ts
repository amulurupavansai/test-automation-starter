import { test, expect } from '../fixtures';
import { credentials } from '../config/environments';

// API-style tests using Playwright's `request` against the demo app's mock API.
// No browser is opened, so these run in milliseconds.
test.describe('API', () => {
  test('login returns a token for valid credentials and 401 otherwise @smoke @regression', async ({ request }) => {
    const ok = await request.post('/api/login', { data: credentials });
    expect(ok.status()).toBe(200);
    expect(await ok.json()).toMatchObject({ token: expect.any(String) });

    const bad = await request.post('/api/login', { data: { email: credentials.email, password: 'nope' } });
    expect(bad.status()).toBe(401);
    expect(await bad.json()).toEqual({ error: 'Invalid email or password' });
  });

  test('employees endpoint requires auth and supports filtering @regression', async ({ request, apiClient }) => {
    expect((await request.get('/api/employees')).status()).toBe(401);

    const all = await (await apiClient.get('/api/employees')).json();
    expect(all.total).toBeGreaterThanOrEqual(5); // other tests may add employees

    const filtered = await (await apiClient.get('/api/employees?q=engineering')).json();
    expect(filtered.items.map((e: { lastName: string }) => e.lastName).sort()).toEqual(['Baker', 'Dunn']);
  });

  test('creating an employee validates input and returns 201 on success @regression', async ({ apiClient }) => {
    const invalid = await apiClient.post('/api/employees', { data: { firstName: '', salary: -5 } });
    expect(invalid.status()).toBe(422);
    const { errors } = await invalid.json();
    expect(errors).toMatchObject({ firstName: 'First name is required', salary: 'Salary must be greater than zero' });

    const created = await apiClient.post('/api/employees', {
      data: { firstName: 'Api', lastName: 'Tester', email: 'api.tester@example.test', department: 'HR', salary: 50000 },
    });
    expect(created.status()).toBe(201);
    expect(await created.json()).toMatchObject({ id: expect.any(Number), lastName: 'Tester', salary: 50000 });
  });
});
