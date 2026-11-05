import { test, expect } from '../fixtures';
import { readJson, uniqueId } from '../utils/data';
import type { EmployeeInput } from '../pages';

const data = readJson<{ newEmployee: EmployeeInput }>('employees.json');

test.describe('Add employee form', () => {
  test.beforeEach(async ({ authedPage, addEmployeePage }) => {
    await addEmployeePage.goto();
  });

  test('empty submit shows every required-field error @regression', async ({ addEmployeePage }) => {
    await addEmployeePage.submit.click();
    await addEmployeePage.expectFieldError('firstName', 'First name is required');
    await addEmployeePage.expectFieldError('lastName', 'Last name is required');
    await addEmployeePage.expectFieldError('email', 'Email is required');
    await addEmployeePage.expectFieldError('department', 'Department is required');
    await addEmployeePage.expectFieldError('salary', 'Salary is required');
    await expect(addEmployeePage.success).toBeHidden();
  });

  test('valid employee is saved and appears in the list @smoke @regression', async ({ addEmployeePage, employeesPage }) => {
    // Unique email avoids collisions when running against a shared environment.
    const employee = { ...data.newEmployee, email: `${uniqueId('farah')}@example.test` };
    await addEmployeePage.add(employee);
    await expect(addEmployeePage.success).toHaveText('Employee Farah Fischer added');

    await employeesPage.goto();
    await employeesPage.searchFor(employee.email);
    await employeesPage.expectNames(['Farah Fischer']);
  });
});
