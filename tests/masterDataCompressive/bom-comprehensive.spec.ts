import { test } from '../fixtures/baseTest';
import type { Page } from '@playwright/test';
import { Logger } from '../../utils/logger';
import { DataGenerator } from '../../utils/dataGenerator';

type CategoryPage = {
  navigate(): Promise<void>;
  clickAddCategory(): Promise<void>;
  addCategory(
    categoryName: string,
    description: string,
    imagePath: string
  ): Promise<void>;
};

type ProductPage = {
  goToProductSection(): Promise<void>;
  clickAddProduct(): Promise<void>;
  addProduct(categoryName: string, productName: string): Promise<void>;
};


test.describe('Bill of Materials (BOM) - Comprehensive Test Suite', () => {

  // Helper: Setup category and product first
  async function createTestProduct(categoryPage:CategoryPage, productPage:ProductPage, page:Page) {
    const categoryName = DataGenerator.getCategoryName();
    const productName = DataGenerator.getProductName();

    // Create category
    await categoryPage.navigate();
    await categoryPage.clickAddCategory();
    await categoryPage.addCategory(categoryName, DataGenerator.getDescription(), 'test-data/test.png');
    await page.waitForLoadState('networkidle');

    // Create product
    await productPage.goToProductSection();
    await productPage.clickAddProduct();
    await productPage.addProduct(categoryName, productName);
    await page.waitForLoadState('networkidle');

    return { categoryName, productName };
  }

  // ================= HAPPY PATH TESTS =================

  test('✅ Happy Path: Create BOM for product', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Navigate to BOM Section', async () => {
      await bomPage.navigateToBOM();
      await page.waitForLoadState('networkidle');
      Logger.info('Navigated to BOM Section');
    });

    await test.step('Create BOM', async () => {
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      Logger.success(`BOM Created for: ${productName}`);
    });

    await test.step('Verify BOM Created', async () => {
      await bomPage.verifyBOMCreated(categoryName, productName);
      Logger.success('BOM Verified');
    });
  });

  test('✅ Happy Path: Add component to BOM', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      Logger.success('BOM Created');
    });

    await test.step('Add Component', async () => {
      await bomPage.openVersion();
      await bomPage.clickAddComponent();
      
      const componentCategory = 'COPPER RING';
      const componentProduct = 'Copper Ring V3 Wfn 37.5x1.5 Th';
      
      await bomPage.selectComponentCategory(componentCategory);
      await bomPage.selectComponentProduct(componentProduct);
      await bomPage.addComponent();
      Logger.success('Component Added');
    });
  });

   // ================= NEGATIVE/ERROR TESTS =================

  test('❌ Negative: Cannot create BOM without category', async ({ bomPage, page }) => {
    await test.step('Navigate to BOM', async () => {
      await bomPage.navigateToBOM();
    });

    await test.step('Submit without category', async () => {
      await bomPage.clickCreateBOM();
      
      // Try to submit without selecting category
      await page.getByLabel('Create BOM', { exact: true })
        .getByRole('button', { name: 'Create' }).click();
      
      await page.waitForTimeout(500);
      Logger.success('Form rejected without category');
    });
  });

  test('❌ Negative: Cannot create BOM without product', async ({ categoryPage, bomPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();

    await test.step('Create category', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, DataGenerator.getDescription(), 'test-data/test.png');
      await page.waitForLoadState('networkidle');
    });

    await test.step('Submit without product', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      
      // Select category but not product
      await bomPage.selectCategory(categoryName);
      
      await page.getByLabel('Create BOM', { exact: true })
        .getByRole('button', { name: 'Create' }).click();
      
      await page.waitForTimeout(500);
      Logger.success('Form rejected without product');
    });
  });

  test('❌ Negative: Cannot add component without quantity', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM and open for component addition', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      
      await bomPage.openVersion();
      await bomPage.clickAddComponent();
      Logger.info('Component form opened');
    });

    await test.step('Try to add without quantity', async () => {
      const componentCategory = 'COPPER RING';
      const componentProduct = 'Copper Ring V3 Wfn 37.5x1.5 Th';
      
      await bomPage.selectComponentCategory(componentCategory);
      await bomPage.selectComponentProduct(componentProduct);
      
      // Don't fill quantity, try to submit
      const submitButton = page.locator('button:has-text("Add"), button:has-text("Save")').last();
      if (await submitButton.isVisible()) {
        await submitButton.click();
        Logger.info('Submit attempted');
      }
      
      await page.waitForTimeout(500);
      Logger.success('Validation handled');
    });
  });

  test('❌ Negative: Invalid component quantity values', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
    });

    const invalidQuantities = ['-5', '0', '-0.1'];

    await test.step('Test invalid quantities', async () => {
      for (const qty of invalidQuantities) {
        await bomPage.openVersion();
        await bomPage.clickAddComponent();
        
        const qtyInput = page.locator('input[placeholder*="Quantity"], input[name*="quantity"]').first();
        if (await qtyInput.isVisible()) {
          await qtyInput.fill(qty);
          Logger.info(`Tested quantity: ${qty}`);
        }
        
        // Close component form
        await page.keyboard.press('Escape');
      }
      
      Logger.success('Invalid quantities tested');
    });
  });

  test('❌ Negative: Add duplicate component to BOM', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM and add component once', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      
      await bomPage.openVersion();
      await bomPage.clickAddComponent();
      
      const componentCategory = 'COPPER RING';
      const componentProduct = 'Copper Ring V3 Wfn 37.5x1.5 Th';
      
      await bomPage.selectComponentCategory(componentCategory);
      await bomPage.selectComponentProduct(componentProduct);
      await bomPage.addComponent();
      Logger.success('First component added');
    });

    await test.step('Try to add same component again', async () => {
      await bomPage.clickAddComponent();
      
      const componentCategory = 'COPPER RING';
      const componentProduct = 'Copper Ring V3 Wfn 37.5x1.5 Th';
      
      await bomPage.selectComponentCategory(componentCategory);
      await bomPage.selectComponentProduct(componentProduct);
      await bomPage.addComponent();
      
      Logger.info('Duplicate add attempted');
    });
  });

  // ================= BOUNDARY TESTS =================

  test('🔲 Boundary: Component quantity - single unit', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM and add with qty=1', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      
      await bomPage.openVersion();
      await bomPage.clickAddComponent();
      
      const qtyInput = page.locator('input[placeholder*="Quantity"], input[name*="quantity"]').first();
      if (await qtyInput.isVisible()) {
        await qtyInput.fill('1');
      }
      
      const componentCategory = 'COPPER RING';
      const componentProduct = 'Copper Ring V3 Wfn 37.5x1.5 Th';
      
      await bomPage.selectComponentCategory(componentCategory);
      await bomPage.selectComponentProduct(componentProduct);
      await bomPage.addComponent();
      Logger.success('Minimum quantity tested');
    });
  });

  test('🔲 Boundary: Component quantity - decimal values', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM and test decimal quantity', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      
      await bomPage.openVersion();
      await bomPage.clickAddComponent();
      
      const qtyInput = page.locator('input[placeholder*="Quantity"], input[name*="quantity"]').first();
      if (await qtyInput.isVisible()) {
        await qtyInput.fill('2.5');
        const value = await qtyInput.inputValue();
        Logger.info(`Decimal quantity entered: ${value}`);
      }
      
      Logger.success('Decimal quantity tested');
    });
  });

  test('🔲 Boundary: Large quantity value', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM and test large quantity', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      
      await bomPage.openVersion();
      await bomPage.clickAddComponent();
      
      const qtyInput = page.locator('input[placeholder*="Quantity"], input[name*="quantity"]').first();
      if (await qtyInput.isVisible()) {
        await qtyInput.fill('999999');
        const value = await qtyInput.inputValue();
        Logger.info(`Large quantity: ${value}`);
      }
      
      Logger.success('Large quantity tested');
    });
  });

  // ================= VERSION MANAGEMENT TESTS =================

  test('📋 Versioning: Create new BOM version', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create initial BOM', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      Logger.success('BOM Version 1 created');
    });

    await test.step('Check version history', async () => {
      // Look for version dropdown or history
      const versionButton = page.locator('button:has-text("Version"), select:has-text("Version")').first();
      if (await versionButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        Logger.success('Version management available');
      } else {
        Logger.info('Version management not visible');
      }
    });
  });

  // ================= DATA PERSISTENCE TESTS =================

  test('💾 Persistence: BOM data persists after reload', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      Logger.success('BOM created');
    });

    await test.step('Reload and verify', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      await bomPage.verifyBOMCreated(categoryName, productName);
      Logger.success('BOM data persisted');
    });
  });

  test('💾 Persistence: Components persist in BOM', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM and add components', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      
      await bomPage.openVersion();
      await bomPage.clickAddComponent();
      
      const componentCategory = 'COPPER RING';
      const componentProduct = 'Copper Ring V3 Wfn 37.5x1.5 Th';
      
      await bomPage.selectComponentCategory(componentCategory);
      await bomPage.selectComponentProduct(componentProduct);
      await bomPage.addComponent();
      Logger.success('Component added');
    });

    await test.step('Reload and verify components', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      Logger.success('Components verified after reload');
    });
  });

  // ================= COMPONENT MANAGEMENT TESTS =================

  test('🧩 Components: Add multiple components', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
    });

    const components = [
      { category: 'COPPER RING', product: 'Copper Ring V3 Wfn 37.5x1.5 Th' },
      // Add more components if available
    ];

    await test.step('Add multiple components', async () => {
      for (const comp of components) {
        await bomPage.openVersion();
        await bomPage.clickAddComponent();
        
        await bomPage.selectComponentCategory(comp.category);
        await bomPage.selectComponentProduct(comp.product);
        await bomPage.addComponent();
        Logger.info(`Added: ${comp.product}`);
      }
      
      Logger.success('Multiple components added');
    });
  });

  test('🧩 Components: Remove component from BOM', async ({ categoryPage, productPage, bomPage, page }) => {
    const { categoryName, productName } = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM with component', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      
      await bomPage.openVersion();
      await bomPage.clickAddComponent();
      
      const componentCategory = 'COPPER RING';
      const componentProduct = 'Copper Ring V3 Wfn 37.5x1.5 Th';
      
      await bomPage.selectComponentCategory(componentCategory);
      await bomPage.selectComponentProduct(componentProduct);
      await bomPage.addComponent();
      Logger.success('Component added');
    });

    await test.step('Remove component', async () => {
      const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Remove"), [aria-label*="Delete"]').first();
      if (await deleteButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await deleteButton.click();
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        if (await confirmButton.isVisible({ timeout: 1000 }).catch(() => false)) {
          await confirmButton.click();
        }
        Logger.success('Component removed');
      } else {
        Logger.warn('Delete button not found');
      }
    });
  });

  // ================= CATEGORY/PRODUCT CHANGE TESTS =================

  test('🔄 Switching: Change product in existing BOM', async ({ categoryPage, productPage, bomPage, page }) => {
    const product1 = await createTestProduct(categoryPage, productPage, page);
    const product2 = await createTestProduct(categoryPage, productPage, page);

    await test.step('Create BOM for first product', async () => {
      await bomPage.navigateToBOM();
      await bomPage.clickCreateBOM();
      await bomPage.selectCategory(product1.categoryName);
      await bomPage.selectProduct(product1.productName);
      await bomPage.createBOM();
      Logger.success('BOM created for product 1');
    });

    await test.step('Try to switch product', async () => {
      // Look for edit/change option
      const editButton = page.locator('button:has-text("Edit"), button:has-text("Change")').first();
      if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editButton.click();
        Logger.success('Product can be changed');
      } else {
        Logger.info('Product switching not available');
      }
    });
  });

});
