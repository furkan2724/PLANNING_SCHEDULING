import { expect, Page } from '@playwright/test';
import { ENV } from '../utils/env';

export class LoginPage {

  constructor(private page: Page) {}

  readonly emailInput = () =>
    this.page.getByPlaceholder('you@company.com');

  readonly passwordInput = () =>
    this.page.locator('input[type="password"]');

  readonly loginButton = () =>
    this.page.getByRole('button', { name: 'Login' });

  // ================= MDM =================

  async navigateToMDM() {
    await this.page.goto(`${ENV.mdmBaseUrl}/login`);
  }

  async loginToMDM() {

    await this.emailInput().fill(ENV.mdmEmail);

    await this.passwordInput().fill(ENV.mdmPassword);

    await this.loginButton().click();

    // Add proper validation after login
  //  await this.page.waitForLoadState('networkidle');
  }

  // ================= PLANNING =================

  async navigateToPlanning() {
    await this.page.goto(`${ENV.planningBaseUrl}/login`);
  }

  async loginToPlanning() {

    await this.emailInput().fill(ENV.planningEmail);

    await this.passwordInput().fill(ENV.planningPassword);

    await this.loginButton().click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Production Planning Dashboard',
      })
    ).toBeVisible();

  }

}