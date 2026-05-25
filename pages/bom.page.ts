import { Page, expect } from '@playwright/test';

export class BomPage {
  constructor(private page: Page) { }

  async navigateToBOM() {
     await this.page.goto('https://mdm-test.c4i4.org/master-data/bom-routing');
   // await this.page.getByRole('button', { name: 'BOM' }).click();
    await expect(this.page.getByText('Bill of Materials (BOM)')).toBeVisible();
  }

  async clickCreateBOM() {
    await this.page.getByRole('button', { name: 'Create BOM' }).click();
  }

  async validateEmptyForm() {
    await this.page.getByLabel('Create New BOM')
      .getByRole('button', { name: 'Create BOM' }).click();

    await expect(this.page.locator('form'))
      .toContainText('Please select a category.');
  }

  async selectCategory(categoryName: string) {
    await this.page.getByRole('button', { name: 'Select Category' }).click();
    await this.page.getByRole('textbox', { name: 'Search categories...' }).fill(categoryName);
    await this.page.getByRole('option', { name: categoryName }).click();
  }

  async selectProduct(productName: string) {
    await this.page.getByRole('button', { name: 'Select Product' }).click();
    await this.page.getByRole('option', { name: productName }).click();
  }

  async createBOM() {
    await this.page.getByLabel('Create New BOM')
      .getByRole('button', { name: 'Create BOM' }).click();
  }

  async verifyBOMCreated(categoryName: string, productName: string) {
    
    // dynamic validation instead of hardcoded string
    await expect(
      this.page.getByText(new RegExp(`${productName}@${categoryName}`))
    ).toBeVisible();
  }
  // ================= COMPONENT =================

  async openVersion() {
    await this.page.getByRole('button', { name: 'v1' }).first().click();
  }

  async clickAddComponent() {
    await this.page.getByRole('button', { name: 'Add Component' }).click();
  }

  async selectComponentCategory(categoryName: string) {
    await this.page.getByRole('button', { name: 'Select Category' }).click();
    await this.page.getByRole('textbox', { name: 'Search categories...' }).fill(categoryName);
    await this.page.getByRole('option', { name: categoryName }).click();
  }

  async selectComponentProduct(productName: string) {
    await this.page.getByRole('button', { name: 'Select Product' }).click();
    await this.page.getByRole('option', { name: productName }).click();
  }

  async addComponent() {
    await this.page.getByLabel('Add Component to BOM')
      .getByRole('button', { name: 'Add Component' }).click();
  }

  async verifyComponentAdded(productName: string) {
    await expect(this.page.getByText(productName)).toBeVisible();
  }

  async verifyBOMAlreadyExists() {
    await expect(this.page.getByText('BOM already exists for')).toBeVisible();
  }

  async closeDialog() {
    await this.page.getByRole('button', { name: 'Close' }).click();
  }
}