import { Page, expect } from '@playwright/test';

export class ResourcePage {
  constructor(private page: Page) {}

  async navigate() {
     await this.page.goto('https://mdm-test.c4i4.org/master-data/resources-capacity');
    // await this.page.getByRole('button', { name: 'Go to dashboard' }).click();
    await this.page.getByRole('button', { name: 'Resources & Capacity' }).click();
  }

  async clickAddResource() {
    await this.page.getByRole('button', { name: 'Add Resource' }).click();
  }

  async validateEmptyForm() {
    await this.page.getByLabel('Add New Resource')
      .getByRole('button', { name: 'Add Resource' }).click();

    await expect(this.page.locator('#resourceName-error'))
      .toContainText('Resource name is required');
    //  await expect(this.page.getByText('Resource name is required')).toBeVisible();
  }

  async addResource(resourceName: string, capacity = '5') {
    await this.page.getByRole('textbox', { name: 'Resource Name *' }).fill(resourceName);
    await this.page.getByRole('spinbutton', { name: 'Capacity Per Day*' }).fill(capacity);

    await this.page.getByRole('button', { name: 'Select unit' }).click();
    await this.page.getByRole('textbox', { name: 'Search units...' }).fill('unit');
    await this.page.getByRole('option', { name: 'Unit' }).click();

    await this.page.getByLabel('Add New Resource')
      .getByRole('button', { name: 'Add Resource' }).click();
  }

  async verifyResourceCreated() {
    await expect(this.page.getByText('Resource created successfully')).toBeVisible();
  }
}