import { test, expect } from '@playwright/test';

test('test', async ({ page }) => {
  await page.goto('https://mdm-test.c4i4.org/master-data/category');
  await page.getByRole('button', { name: 'Add Category' }).click();
  await page.getByLabel('Add New Category').getByRole('button', { name: 'Add Category' }).click();
  await expect(page.getByText('Category name is required')).toBeVisible();
  await page.getByRole('textbox', { name: 'Category Name*' }).click();
  await page.getByRole('textbox', { name: 'Category Name*' }).fill('abc');
  await page.getByLabel('Add New Category').getByRole('button', { name: 'Add Category' }).click();
  await page.getByRole('textbox', { name: 'Category Name*' }).click();
  await page.getByRole('textbox', { name: 'Category Name*' }).fill('abcd');
  await page.getByLabel('Add New Category').getByRole('button', { name: 'Add Category' }).click();
});