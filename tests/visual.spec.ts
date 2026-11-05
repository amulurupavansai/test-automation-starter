import { test, expect } from '../fixtures';

// Visual regression. Baselines live in tests/visual.spec.ts-snapshots/.
// Update intentionally with: npm run snapshots:update
test.describe('Visual', () => {
  test('payslip summary matches the baseline @regression', async ({ authedPage, payslipPage }) => {
    await payslipPage.goto();
    await expect(payslipPage.netPay).toHaveText('$4,230.00');
    await expect(payslipPage.table).toHaveScreenshot('payslip-table.png');
  });
});
