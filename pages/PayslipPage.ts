import { Locator, Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class PayslipPage extends BasePage {
  readonly path = '/payslip.html';
  readonly heading: Locator;
  readonly meta: Locator;
  readonly netPay: Locator;
  readonly table: Locator;

  constructor(page: Page) {
    super(page);
    this.heading = page.getByRole('heading', { name: 'Payslip summary' });
    this.meta = page.locator('#payslip-meta');
    this.netPay = page.locator('#net-pay');
    this.table = page.getByRole('table');
  }
}
