import { Page, expect } from '@playwright/test';

export class ProcessRoutingPage {
  constructor(private page: Page) {}

  // ================= NAVIGATION =================
  async navigate() {
  //  await this.page.goto('https://mdm-test.c4i4.org/master-data/process-routing');
    await this.page.getByRole('button', { name: 'Process Routing' }).click();
    await expect(this.page.getByRole('main')).toContainText('Process Routing Visualization');
  }

  // ================= CREATE ROUTING =================
  async clickAddRouting() {
    await this.page.getByRole('button', { name: 'Add Routing' }).click();
  }

  async validateEmptyForm() {
    await this.page
      .getByLabel('Add Process Routing')
      .getByRole('button', { name: 'Add Routing' })
      .click();

    await expect(this.page.locator('form')).toContainText('Product is required.');
  }

  async selectProduct(productName: string) {
    await this.page.getByRole('button', { name: 'Select a product' }).click();
   // await this.page.getByRole('option', { name: new RegExp(productName) }).click();
    
    await this.page.getByRole('textbox', { name: 'Search products...' }).fill(productName);
    await this.page.getByRole('option', { name: productName }).click();
  }

  async selectResource(resourceName: string) {
    await this.page.getByRole('button', { name: 'Select a resource' }).click();
    await this.page.getByRole('textbox', { name: 'Search resources...' }).fill(resourceName);
    await this.page.getByRole('option', { name: resourceName }).click();
  }

  async fillWorkstationTimes(time: string | number) {
    const value = String(time);

    // Workstation 1
    await this.page.locator('[id="workstation_data[0].process_time_minutes"]').fill(value);
    await this.page.locator('[id="workstation_data[0].setup_time_minutes"]').fill(value);
    await this.page.locator('[id="workstation_data[0].wait_time_minutes"]').fill(value);
    await this.page.locator('[id="workstation_data[0].move_time_minutes"]').fill(value);

    // Workstation 2
    // await this.page.locator('[id="workstation_data[1].process_time_minutes"]').fill(value);
    // await this.page.locator('[id="workstation_data[1].setup_time_minutes"]').fill(value);
    // await this.page.locator('[id="workstation_data[1].wait_time_minutes"]').fill(value);
    // await this.page.locator('[id="workstation_data[1].move_time_minutes"]').fill(value);
  }

  async submitRouting() {
    await this.page
      .getByLabel('Add Process Routing')
      .getByRole('button', { name: 'Add Routing' })
      .click();
  }

  async verifyRoutingCreated(productName: string) {
    await expect(
      this.page.getByRole('button', { name: new RegExp(productName) })
    ).toBeVisible();
  }

  // ================= EDIT ROUTING =================
  async editRouting(productName: string) {
    await this.page.getByRole('button', { name: new RegExp(productName) }).click();
    await this.page.getByRole('button', { name: 'Edit Routing' }).click();
    await this.page.getByRole('button', { name: 'Update Routing' }).click();
  }

  async verifyRoutingUpdated() {
    await expect(this.page.getByText('Process routing updated')).toBeVisible();
  }
}