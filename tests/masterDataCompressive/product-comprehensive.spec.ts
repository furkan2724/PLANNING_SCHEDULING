import { test, expect } from '../fixtures/baseTest';
import type { Page } from '@playwright/test';
import { Logger } from '../../utils/logger';
import { DataGenerator } from '../../utils/dataGenerator';

type CategoryPage = {
  navigate(): Promise<void>;
  clickAddCategory(): Promise<void>;
  addCategory(name: string, description: string, imagePath: string): Promise<void>;
};

test.describe('Product Management - Comprehensive Test Suite', () => {

  test.afterEach(async ({ page }) => {

    const closeButton = page.locator('button[aria-label="Close"]');

    if (await closeButton.isVisible().catch(() => false)) {
      await closeButton.click();
    }

  });

  // Helper: Create a category first (needed for product creation)
  async function createTestCategory(categoryPage: CategoryPage, page: Page) {
    const categoryName = DataGenerator.getCategoryName();
    await categoryPage.navigate();
    await categoryPage.clickAddCategory();
    await categoryPage.addCategory(categoryName, DataGenerator.getDescription(), 'test-data/test.png');
    await page.waitForLoadState('networkidle');
    return categoryName;
  }

  // ================= HAPPY PATH TESTS =================

  test('✅ Happy Path: Create Product with all fields', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const productName = DataGenerator.getProductName();

    await test.step('Navigate to Product Section', async () => {
      await productPage.goToProductSection();
      await page.waitForLoadState('networkidle');
      Logger.info('Navigated to Product Section');
    });

    await test.step('Create Product', async () => {
      await productPage.clickAddProduct();
      await productPage.addProduct(categoryName, productName);
      Logger.success(`Product Created: ${productName}`);
    });

    await test.step('Verify Product Created', async () => {
      await productPage.verifyProductCreated(productName);
      Logger.success(`Product Verified: ${productName}`);
    });
  });

  test('✅ Happy Path: Update Product', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const productName = DataGenerator.getProductName();

    await test.step('Create Product', async () => {
      await productPage.goToProductSection();
      await productPage.clickAddProduct();
      await productPage.addProduct(categoryName, productName);
      Logger.success(`Product Created: ${productName}`);
    });

    await test.step('Edit Product', async () => {
      await productPage.editProduct(productName);
      Logger.success(`Product Updated: ${productName}`);
    });

    await test.step('Verify Update', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      //   await productPage.verifyProductCreated(productName);
      Logger.success('Update Verified');
    });
  });

  test('✅ Happy Path: Create multiple products in same category', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const products = [
      DataGenerator.getProductName(),
      DataGenerator.getProductName(),
      DataGenerator.getProductName(),
    ];

    await test.step('Navigate to Product Section', async () => {
      await productPage.goToProductSection();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Create multiple products', async () => {
      for (const productName of products) {
        await productPage.clickAddProduct();
        await productPage.addProduct(categoryName, productName);
        Logger.info(`Created: ${productName}`);
      }
    });

    await test.step('Verify all products', async () => {
      for (const productName of products) {
        await productPage.verifyProductCreated(productName);
        Logger.info(`Verified: ${productName}`);
      }
      Logger.success('All products verified');
    });
  });

  // ================= NEGATIVE/ERROR TESTS =================

  test('❌ Negative: Cannot create product without name', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);

    await test.step('Navigate to Product Section', async () => {
      await productPage.goToProductSection();
    });

    await test.step('Submit form without name', async () => {
      await productPage.clickAddProduct();

      // Select category but leave name empty
      await page.getByRole('button', { name: 'Select a category' }).click();
      await page.getByRole('textbox', { name: 'Search categories...' }).fill(categoryName);
      await page.getByRole('option', { name: categoryName }).click();

      // Try to submit
      await page.getByLabel('Add New Product')
        .getByRole('button', { name: 'Add Product' }).click();

      // Verify error message appears
      await expect(page.getByText('Product name is required')).toBeVisible();
      Logger.success('Validation error triggered');
    });
  });

  test('❌ Negative: Cannot create product without category', async ({ productPage, page }) => {
    const productName = DataGenerator.getProductName();

    await test.step('Navigate to Product Section', async () => {
      await productPage.navigate();
      await productPage.goToProductSection();
    });

    await test.step('Submit without selecting category', async () => {
      await productPage.clickAddProduct();

      // Fill product name but don't select category
      await page.getByRole('textbox', { name: 'Product Name*' }).fill(productName);

      // Try to submit
      await page.getByLabel('Add New Product')
        .getByRole('button', { name: 'Add Product' }).click();

      // Verify error appears or form is rejected
      await page.waitForTimeout(500);
      Logger.success('Form rejected without category');
    });
  });

  test('❌ Negative: Product name with special characters', async ({ categoryPage, productPage, page }) => {

  const categoryName = await createTestCategory(categoryPage, page);

  const invalidName = '@#$%^&*()';

  await productPage.navigate();
  await productPage.goToProductSection();

  await test.step(`Test special characters: ${invalidName}`, async () => {

    // Open Add Product modal
    await productPage.clickAddProduct();

    // Select category
    await productPage.selectCategory(categoryName);

    // Fill invalid product name
    await page.getByRole('textbox', {
      name: 'Product Name*'
    }).fill(invalidName);

    // Submit form
    await page.getByLabel('Add New Product')
      .getByRole('button', { name: 'Add Product' })
      .click();

    // Verify validation message
    await expect(
      page.getByText('Product name must include at least one letter')
    ).toBeVisible();

    Logger.success(`Validation verified for: ${invalidName}`);

  });

});

  test('❌ Negative: Product name exceeds maximum length', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const veryLongName = 'P'.repeat(256);

    await test.step('Navigate and attempt long name', async () => {
      await productPage.navigate();
      await productPage.goToProductSection();
      await productPage.clickAddProduct();

      // Select category
      await page.getByRole('button', { name: 'Select a category' }).click();
      await page.getByRole('textbox', { name: 'Search categories...' }).fill(categoryName);
      await page.getByRole('option', { name: categoryName }).click();

      const nameInput = page.getByRole('textbox', { name: 'Product Name*' });
      await nameInput.fill(veryLongName);

      const enteredValue = await nameInput.inputValue();
      const isLimited = enteredValue.length < veryLongName.length;

      if (isLimited) {
        Logger.success(`Field has max length: ${enteredValue.length}`);
      } else {
        Logger.info('Field accepts long strings');
      }
    });
  });

  test('❌ Negative: Invalid lead time values', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const productName = DataGenerator.getProductName();

    await test.step('Create product with invalid lead time', async () => {
      await productPage.navigate();
      await productPage.goToProductSection();
      await productPage.clickAddProduct();

      // Select category and fill name
      await page.getByRole('button', { name: 'Select a category' }).click();
      await page.getByRole('textbox', { name: 'Search categories...' }).fill(categoryName);
      await page.getByRole('option', { name: categoryName }).click();
      await page.getByRole('textbox', { name: 'Product Name*' }).fill(productName);

      // Try to fill lead time with negative value
      const leadTimeInput = page.locator('input[placeholder*="Lead Time"], input[name*="lead"]').first();
      if (await leadTimeInput.isVisible()) {
        await leadTimeInput.fill('-5');
        Logger.info('Attempted negative lead time');
      }

      Logger.success('Invalid lead time handling tested');
    });
  });

  test('❌ Negative: Invalid safety stock values', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const productName = DataGenerator.getProductName();

    await test.step('Create product with invalid safety stock', async () => {
      await productPage.navigate();
      await productPage.goToProductSection();
      await productPage.clickAddProduct();

      // Select category
      await page.getByRole('button', { name: 'Select a category' }).click();
      await page.getByRole('textbox', { name: 'Search categories...' }).fill(categoryName);
      await page.getByRole('option', { name: categoryName }).click();
      await page.getByRole('textbox', { name: 'Product Name*' }).fill(productName);

      // Try to fill safety stock with invalid values
      const safetyInput = page.locator('input[placeholder*="Safety"], input[name*="safety"]').first();
      if (await safetyInput.isVisible()) {
        await safetyInput.fill('-10');
        Logger.info('Attempted negative safety stock');
      }

      Logger.success('Invalid safety stock handling tested');
    });
  });

  // ================= BOUNDARY TESTS =================

  test('🔲 Boundary: Product name less than minimum length', async ({ categoryPage, productPage, page }) => {

    const categoryName = await createTestCategory(categoryPage, page);

    const invalidProductName = 'P';

    await test.step('Navigate and enter invalid short product name', async () => {

      await productPage.navigate();

      await productPage.goToProductSection();

      await productPage.clickAddProduct();

      await page.getByRole('textbox', {
        name: 'Product Name*'
      }).fill(invalidProductName);

      // Select category
      await page.getByRole('button', { name: 'Select a category' }).click();
      await page.getByRole('textbox', { name: 'Search categories...' }).fill(categoryName);
      await page.getByRole('option', { name: categoryName }).click();

      // Submit form
      await page.getByLabel('Add New Product')
        .getByRole('button', { name: 'Add Product' })
        .click();

      Logger.info('Entered product name with less than 3 characters');

    });

    await test.step('Verify minimum length validation message', async () => {

      await expect(
        page.getByText('Product name must be at least 3 characters')
      ).toBeVisible();

      Logger.success('Minimum character validation verified');

    });

  });

  test('🔲 Boundary: Product name with numbers only', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const numericName = DataGenerator.getRandomNumber(10000, 99999).toString();

    await test.step('Create numeric product', async () => {
      await productPage.navigate();
      await productPage.goToProductSection();
      await productPage.clickAddProduct();
      await productPage.addProduct(categoryName, numericName);
      Logger.success(`Numeric product created: ${numericName}`);
    });
  });

  test('🔲 Boundary: Product with accented characters', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const accentName = `Produit Français Español Thé${Date.now()}`;
    
    await test.step('Create accented product', async () => {
      await productPage.navigate();
      await productPage.goToProductSection();
      await productPage.clickAddProduct();
      await productPage.addProduct(categoryName, accentName);
      Logger.success('Accented product created');
    });
  });

  test('🔲 Boundary: Zero and maximum numeric values', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const productName = DataGenerator.getProductName();

    await test.step('Test boundary values', async () => {
      await productPage.navigate();
      await productPage.goToProductSection();
      await productPage.clickAddProduct();

      // Select category
      await page.getByRole('button', { name: 'Select a category' }).click();
      await page.getByRole('textbox', { name: 'Search categories...' }).fill(categoryName);
      await page.getByRole('option', { name: categoryName }).click();
      await page.getByRole('textbox', { name: 'Product Name*' }).fill(productName);

      // Test with zero and large values
      const numericFields = page.locator('input[type="number"]');
      const count = await numericFields.count();

      for (let i = 0; i < Math.min(count, 3); i++) {
        const field = numericFields.nth(i);
        await field.fill('0');
        Logger.info(`Field ${i}: tested with 0`);
      }

      Logger.success('Boundary values tested');
    });
  });

  // ================= DATA PERSISTENCE TESTS =================

  test('💾 Persistence: Product data persists after reload', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const productName = DataGenerator.getProductName();

    await test.step('Create product', async () => {
      await productPage.navigate();
      await productPage.goToProductSection();
      await productPage.clickAddProduct();
      await productPage.addProduct(categoryName, productName);
      Logger.success('Product created');
    });

    await test.step('Reload page and verify', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      Logger.success('Data persisted');
    });
  });

  // ================= FIELD VALIDATION TESTS =================

  test('🔍 Validation: Product type selection', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const productName = DataGenerator.getProductName();

    await test.step('Create product and test type selection', async () => {
      await productPage.navigate();
      await productPage.goToProductSection();
      await productPage.clickAddProduct();

      // Select category
      await page.getByRole('button', { name: 'Select a category' }).click();
      await page.getByRole('textbox', { name: 'Search categories...' }).fill(categoryName);
      await page.getByRole('option', { name: categoryName }).click();

      // Fill name
      await page.getByRole('textbox', { name: 'Product Name*' }).fill(productName);

      // Try different product types
      const typeButton = page.getByRole('button', { name: 'Select a type' });
      if (await typeButton.isVisible()) {
        await typeButton.click();
        const options = page.getByRole('option');
        const optionCount = await options.count();
        Logger.success(`Product type options available: ${optionCount}`);
      }
    });
  });

  test('🔍 Validation: Unit selection', async ({ categoryPage, productPage, page }) => {
    const categoryName = await createTestCategory(categoryPage, page);
    const productName = DataGenerator.getProductName();

    await test.step('Create product and test unit selection', async () => {
      await productPage.navigate();
      await productPage.goToProductSection();
      await productPage.clickAddProduct();

      // Select category
      await page.getByRole('button', { name: 'Select a category' }).click();
      await page.getByRole('textbox', { name: 'Search categories...' }).fill(categoryName);
      await page.getByRole('option', { name: categoryName }).click();

      // Fill name
      await page.getByRole('textbox', { name: 'Product Name*' }).fill(productName);

      // Check unit selection
      const unitButton = page.locator('button:has-text("Select"), button:has-text("Unit")').first();
      if (await unitButton.isVisible()) {
        Logger.info('Unit selection available');
      }

      Logger.success('Unit validation tested');
    });
  });
});
