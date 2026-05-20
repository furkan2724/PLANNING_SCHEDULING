import { Page, expect } from '@playwright/test';

export class ProductPage {
  constructor(private page: Page) {}

   async navigate() {
    await this.page.goto('https://mdm-test.c4i4.org/master-data/product-master');
  }

  async goToProductSection() {
    await this.page.getByRole('button', { name: 'Product Master' }).click();
  }

 async clickAddProduct() {

  await this.page
    .getByRole('button', { name: 'Add Product' })
    .first()
    .click();

}

async selectCategory(categoryName: string) {

  await this.page.getByRole('button', {
    name: 'Select a category'
  }).click();

  await this.page.getByRole('textbox', {
    name: 'Search categories...'
  }).fill(categoryName);

  await this.page.getByRole('option', {
    name: categoryName
  }).click();
}

  async validateEmptyForm() {
    await this.page.getByLabel('Add New Product')
      .getByRole('button', { name: 'Add Product' }).click();

    await expect(this.page.locator('#productName-error'))
      .toContainText('Product name is required');
  }

  async addProduct(category: string, name: string) {
    await this.page.getByRole('button', { name: 'Select a category' }).click();
    await this.page.getByRole('textbox', { name: 'Search categories...' }).fill(category);
    await this.page.getByRole('option', { name: category }).click();

    await this.page.getByRole('textbox', { name: 'Product Name*' }).fill(name);

    await this.page.getByRole('button', { name: 'Select a type' }).click();
    await this.page.getByRole('option', { name: 'Semi-Finished' }).click();

    await this.page.getByRole('button', { name: 'Select a unit' }).click();
    await this.page.getByRole('textbox', { name: 'Search units...' }).fill('Unit');
    await this.page.getByRole('option', { name: 'Unit' }).click();

    await this.page.getByRole('spinbutton', { name: 'Lead Time (days)*' }).fill('10');
    await this.page.getByRole('spinbutton', { name: 'Safety Stock*' }).fill('5');

    await this.page.getByRole('textbox', { name: 'Product description' })
      .fill('Testing Product');

    await this.page.getByLabel('Add New Product')
      .getByRole('button', { name: 'Add Product' }).click();
  }

  async verifyProductCreated(name: string) {
    await expect(this.page.getByText('Product created successfully')).toBeVisible();
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async editProduct(name: string) {
    await this.page.getByRole('button', { name: `Edit ${name}` }).click();

    await this.page.getByRole('textbox', { name: 'Product description' })
      .fill('Testing Product Update');

    await this.page.getByRole('button', { name: 'Update Product' }).click();

    await expect(this.page.getByText('Product updated successfully')).toBeVisible();
  }
}