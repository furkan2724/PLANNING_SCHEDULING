import { Page, expect } from '@playwright/test';

export class CategoryPage {
  constructor(private page: Page) {}

  async navigate() {
    await this.page.goto('https://mdm-test.c4i4.org/master-data/category');
  }

  async verifyPageLoaded() {
    await expect(this.page.getByRole('heading', { name: 'Categories' })).toBeVisible();
  }

  async clickAddCategory() {
    await this.page.getByRole('button', { name: 'Add Category' }).click();
  }

  async validateEmptyForm() {
    await this.page.getByLabel('Add New Category')
      .getByRole('button', { name: 'Add Category' }).click();

    // await expect(this.page.locator('name-error'))
    //   .toContainText('Category name is required.');
      await expect(this.page.getByText('Category name is required')).toBeVisible();
  }

  async uploadCategoryIcon(filePath: string) {
  const modal = this.page.getByLabel('Add New Category');

  // Click the upload button (optional, just to mimic user flow)
  //await modal.getByRole('button', { name: 'Upload Image' }).click();

  // Set file on hidden input
  await modal.locator('input[type="file"]').setInputFiles(filePath);
}

  async addCategory(name: string, desc: string, filePath: string) {
    await this.page.getByRole('textbox', { name: 'Category Name*' }).fill(name);
    await this.page.getByRole('textbox', { name: 'Category description' }).fill(desc);

      // Upload image
    await this.uploadCategoryIcon(filePath);

    await this.page.getByLabel('Add New Category')
      .getByRole('button', { name: 'Add Category' }).click();
  }

  async verifyCategoryCreated(name: string) {
    await expect(this.page.getByText(name)).toBeVisible();
  }

  async verifyImageUploaded(name: string) {
  await expect(
    this.page.getByRole('button', { name: `View image for ${name}` })
  ).toBeVisible();
}

  async editCategory(name: string, updatedDesc: string) {
    await this.page.getByRole('button', { name: `Edit ${name}` }).click();
    await this.page.getByRole('textbox', { name: 'Category description' }).fill(updatedDesc);
    await this.page.getByRole('button', { name: 'Update Category' }).click();
  }
}