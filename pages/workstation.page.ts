import { Page, expect } from '@playwright/test';

export class WorkstationPage {
  constructor(private page: Page) { }

  async goToWorkstationSection() {
    await this.page.getByRole('button', { name: 'Workstations' }).click();
  }

  async clickAddWorkstation() {
    await this.page.getByRole('button', { name: 'Add Workstation' }).click();
  }

  async validateEmptyForm() {
    await this.page.getByLabel('Add New Workstation')
      .getByRole('button', { name: 'Add Workstation' }).click();

    await expect(this.page.locator('#workstationName-error'))
      .toContainText('Workstation name is required');
  }

  async fillWorkstationName(name: string) {
    await this.page.getByRole('textbox', { name: 'Workstation name' }).fill(name);
  }

  async selectResource(resourceName: string) {
    await this.page.getByRole('button', { name: 'Select resources' }).click();
    await this.page.getByRole('textbox', { name: 'Search resources...' }).fill(resourceName);
    await this.page.getByRole('option', { name: `✓ ${resourceName}` }).click();
  }

  async selectSubInventory() {
    await this.page.getByRole('button', { name: 'Select Sub Inventory' }).click();
    await this.page.getByRole('option', { name: 'SUB00001 - RM_STORE' }).click();
  }

  async addWorkstation() {
    await this.page.getByLabel('Add New Workstation')
      .getByRole('button', { name: 'Add Workstation' }).click();
  }

  async verifyWorkstationCreated() {
    await expect(this.page.getByText('Workstation created successfully')).toBeVisible();
  }
}