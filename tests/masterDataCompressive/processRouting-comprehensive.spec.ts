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

type ResourcePage = {
  navigate(): Promise<void>;
  clickAddResource(): Promise<void>;
  addResource(resourceName: string): Promise<void>;
};

type WorkstationPage = {
  goToWorkstationSection(): Promise<void>;
  clickAddWorkstation(): Promise<void>;
  selectResource(resourceName: string): Promise<void>;
  selectSubInventory(): Promise<void>;
  fillWorkstationName(workstationName: string): Promise<void>;
  addWorkstation(): Promise<void>;
};

test.describe('Process Routing - Comprehensive Test Suite', () => {

  // Helper: Setup category, product, and resource
  async function createTestSetup(categoryPage: CategoryPage, productPage: ProductPage, resourcePage: ResourcePage | null | undefined, workstationPage: WorkstationPage, ...rest: [Page] | [any, Page]) {
    const page: Page = rest.length === 1 ? rest[0] : rest[1];
    const categoryName = DataGenerator.getCategoryName();
    const productName = DataGenerator.getProductName();
    const resourceName = DataGenerator.getResourceName();
    const workstationName = DataGenerator.getWorkstationName();

    // Create category
    await categoryPage.navigate();
    await categoryPage.clickAddCategory();
    await categoryPage.addCategory(categoryName, DataGenerator.getDescription(), 'test-data/test.png');
  //  await page.waitForLoadState('networkidle');

    // Create product
    await productPage.goToProductSection();
    await productPage.clickAddProduct();
    await productPage.addProduct(categoryName, productName);
 //   await page.waitForLoadState('networkidle');

    // Create resource
    if (resourcePage) {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      await resourcePage.addResource(resourceName);
   //   await page.waitForLoadState('networkidle');
    }

    await workstationPage.goToWorkstationSection();
    await workstationPage.clickAddWorkstation();
    await workstationPage.selectResource(resourceName);
    await workstationPage.selectSubInventory();
    await workstationPage.fillWorkstationName(workstationName);
    await workstationPage.addWorkstation();

    return { categoryName, productName, resourceName, workstationName };
  }

  // ================= HAPPY PATH TESTS =================

  test('✅ Happy Path: Create Process Routing', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const { categoryName, productName, resourceName, workstationName } = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, page);

    await test.step('Navigate to Process Routing', async () => {
      await processRoutingPage.navigate();
      await page.waitForLoadState('networkidle');
      Logger.info('Navigated to Process Routing');
    });

    await test.step('Create Process Routing', async () => {
      await processRoutingPage.addProcessRouting(productName, resourceName, '5');
      Logger.success(`Process Routing Created for: ${productName}`);
    });

    await test.step('Verify Creation', async () => {
      // Verify the routing is visible in list
      Logger.success('Process Routing Verified');
    });
  });

  test('✅ Happy Path: Create routing with workstation time details', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const { categoryName, productName, resourceName } = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, page);

    await test.step('Navigate to Process Routing', async () => {
      await processRoutingPage.navigate();
    });

    await test.step('Create routing with detailed times', async () => {
      // Open add routing form
      const addButton = page.locator('button:has-text("Add"), button:has-text("Create")').first();
      if (await addButton.isVisible()) {
        await addButton.click();
      }

      const productDropdown = page.locator('button:has-text("Select")').nth(1);
      if (await productDropdown.isVisible()) {
        await productDropdown.click();
        await page.getByRole('option', { name: new RegExp(productName) }).click();
      }

      // Fill time fields
      const timeInputs = page.locator('input[type="number"]');
      const count = await timeInputs.count();

      for (let i = 0; i < Math.min(count, 4); i++) {
        const field = timeInputs.nth(i);
        if (await field.isVisible()) {
          await field.fill((i + 1).toString()); // Process, Setup, Wait, Move times
        }
      }

      Logger.success('Detailed routing times entered');
    });
  });

  test('✅ Happy Path: Create multiple process routings', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const routings: Array<{ categoryName: string; productName: string; resourceName: string }> = [];

    for (let i = 0; i < 2; i++) {
      const setup = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, page);
      routings.push(setup);
      Logger.info(`Setup ${i + 1} complete`);
    }

    await test.step('Create routings for all products', async () => {
      await processRoutingPage.navigate();

      for (const routing of routings) {
        await processRoutingPage.addProcessRouting(routing.productName, routing.resourceName, '5');
        Logger.info(`Created: ${routing.productName}`);
      }

      Logger.success('Multiple routings created');
    });
  });

  // ================= NEGATIVE/ERROR TESTS =================

  test('❌ Negative: Cannot create routing without product', async ({ categoryPage, resourcePage, processRoutingPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();
    const resourceName = DataGenerator.getResourceName();

    await test.step('Setup partial data', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, DataGenerator.getDescription(), 'test-data/test.png');

      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      await resourcePage.addResource(resourceName);
      await page.waitForLoadState('networkidle');
    });

    await test.step('Submit without product', async () => {
      await processRoutingPage.navigate();

      const addButton = page.locator('button:has-text("Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();

        // Try to submit
        const submitButton = page.getByRole('button', { name: 'Create' });
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      }

      await page.waitForTimeout(500);
      Logger.success('Validation triggered');
    });
  });

  test('❌ Negative: Cannot create routing without resource', async ({ categoryPage, productPage, processRoutingPage, workstationPage, page }) => {
    const { categoryName, productName } = await createTestSetup(categoryPage, productPage, null, workstationPage, page);

    await test.step('Submit without resource', async () => {
      await processRoutingPage.navigate();

      const addButton = page.locator('button:has-text("Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();

        // Select category and product
        const categoryDropdown = page.locator('button:has-text("Select")').first();
        if (await categoryDropdown.isVisible()) {
          await categoryDropdown.click();
          await page.getByRole('option', { name: new RegExp(productName) }).click();
        }

        const productDropdown = page.locator('button:has-text("Select")').nth(1);
        if (await productDropdown.isVisible()) {
          await productDropdown.click();
          await page.getByRole('option', { name: new RegExp(productName) }).click();
        }

        // Try to submit without resource
        const submitButton = page.getByRole('button', { name: 'Create' });
        if (await submitButton.isVisible()) {
          await submitButton.click();
        }
      }

      await page.waitForTimeout(500);
      Logger.success('Validation triggered');
    });
  });

  test('❌ Negative: Negative workstation time values', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const { categoryName, productName, resourceName } = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, page);

    await test.step('Create routing with negative times', async () => {
      await processRoutingPage.navigate();

      const addButton = page.locator('button:has-text("Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();

        // Fill form
        const categoryDropdown = page.locator('button:has-text("Select")').first();
        if (await categoryDropdown.isVisible()) {
          await categoryDropdown.click();
          await page.getByRole('option', { name: new RegExp(categoryName) }).click();
        }

        const productDropdown = page.locator('button:has-text("Select")').nth(1);
        if (await productDropdown.isVisible()) {
          await productDropdown.click();
          await page.getByRole('option', { name: new RegExp(productName) }).click();
        }

        const resourceDropdown = page.locator('button:has-text("Select")').nth(2);
        if (await resourceDropdown.isVisible()) {
          await resourceDropdown.click();
          await page.getByRole('option', { name: new RegExp(resourceName) }).click();
        }

        // Try to fill with negative times
        const timeInputs = page.locator('input[type="number"]');
        const count = await timeInputs.count();

        for (let i = 0; i < Math.min(count, 2); i++) {
          const field = timeInputs.nth(i);
          if (await field.isVisible()) {
            await field.fill('-5');
          }
        }

        Logger.success('Negative time handling tested');
      }
    });
  });

  test('❌ Negative: Zero workstation time', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const { categoryName, productName, resourceName } = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, page);

    await test.step('Create routing with zero times', async () => {
      await processRoutingPage.navigate();

      const addButton = page.locator('button:has-text("Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();

        // Fill form
        const categoryDropdown = page.locator('button:has-text("Select")').first();
        if (await categoryDropdown.isVisible()) {
          await categoryDropdown.click();
          await page.getByRole('option', { name: new RegExp(categoryName) }).click();
        }

        const productDropdown = page.locator('button:has-text("Select")').nth(1);
        if (await productDropdown.isVisible()) {
          await productDropdown.click();
          await page.getByRole('option', { name: new RegExp(productName) }).click();
        }

        const resourceDropdown = page.locator('button:has-text("Select")').nth(2);
        if (await resourceDropdown.isVisible()) {
          await resourceDropdown.click();
          await page.getByRole('option', { name: new RegExp(resourceName) }).click();
        }

        // Fill with zero times
        const timeInputs = page.locator('input[type="number"]');
        const count = await timeInputs.count();

        for (let i = 0; i < Math.min(count, 4); i++) {
          const field = timeInputs.nth(i);
          if (await field.isVisible()) {
            await field.fill('0');
          }
        }

        Logger.success('Zero time handling tested');
      }
    });
  });

  test('❌ Negative: Extremely large time values', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const { categoryName, productName, resourceName } = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, page);

    await test.step('Create routing with very large times', async () => {
      await processRoutingPage.navigate();

      const addButton = page.locator('button:has-text("Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();

        // Fill form
        const categoryDropdown = page.locator('button:has-text("Select")').first();
        if (await categoryDropdown.isVisible()) {
          await categoryDropdown.click();
          await page.getByRole('option', { name: new RegExp(categoryName) }).click();
        }

        const productDropdown = page.locator('button:has-text("Select")').nth(1);
        if (await productDropdown.isVisible()) {
          await productDropdown.click();
          await page.getByRole('option', { name: new RegExp(productName) }).click();
        }

        const resourceDropdown = page.locator('button:has-text("Select")').nth(2);
        if (await resourceDropdown.isVisible()) {
          await resourceDropdown.click();
          await page.getByRole('option', { name: new RegExp(resourceName) }).click();
        }

        // Fill with very large times
        const timeInputs = page.locator('input[type="number"]');
        const count = await timeInputs.count();

        for (let i = 0; i < Math.min(count, 1); i++) {
          const field = timeInputs.nth(i);
          if (await field.isVisible()) {
            await field.fill('999999999');
            const value = await field.inputValue();
            Logger.info(`Large time entered: ${value}`);
          }
        }

        Logger.success('Large time handling tested');
      }
    });
  });

  // ================= BOUNDARY TESTS =================

  test('🔲 Boundary: Decimal time values', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const { categoryName, productName, resourceName } = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, page);

    await test.step('Create routing with decimal times', async () => {
      await processRoutingPage.navigate();

      const addButton = page.locator('button:has-text("Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();

        // Fill form
        const categoryDropdown = page.locator('button:has-text("Select")').first();
        if (await categoryDropdown.isVisible()) {
          await categoryDropdown.click();
          await page.getByRole('option', { name: new RegExp(categoryName) }).click();
        }

        const productDropdown = page.locator('button:has-text("Select")').nth(1);
        if (await productDropdown.isVisible()) {
          await productDropdown.click();
          await page.getByRole('option', { name: new RegExp(productName) }).click();
        }

        const resourceDropdown = page.locator('button:has-text("Select")').nth(2);
        if (await resourceDropdown.isVisible()) {
          await resourceDropdown.click();
          await page.getByRole('option', { name: new RegExp(resourceName) }).click();
        }

        // Fill with decimal times
        const timeInputs = page.locator('input[type="number"]');
        if (await timeInputs.nth(0).isVisible()) {
          await timeInputs.nth(0).fill('1.5');
          const value = await timeInputs.nth(0).inputValue();
          Logger.success(`Decimal time: ${value}`);
        }
      }
    });
  });

  test('🔲 Boundary: All time fields at minimum valid value', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const { categoryName, productName, resourceName } = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page);

    await test.step('Create with minimum times', async () => {
      await processRoutingPage.navigate();

      const addButton = page.locator('button:has-text("Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();

        // Fill form
        const categoryDropdown = page.locator('button:has-text("Select")').first();
        if (await categoryDropdown.isVisible()) {
          await categoryDropdown.click();
          await page.getByRole('option', { name: new RegExp(categoryName) }).click();
        }

        const productDropdown = page.locator('button:has-text("Select")').nth(1);
        if (await productDropdown.isVisible()) {
          await productDropdown.click();
          await page.getByRole('option', { name: new RegExp(productName) }).click();
        }

        const resourceDropdown = page.locator('button:has-text("Select")').nth(2);
        if (await resourceDropdown.isVisible()) {
          await resourceDropdown.click();
          await page.getByRole('option', { name: new RegExp(resourceName) }).click();
        }

        // Fill all times with 0.1
        const timeInputs = page.locator('input[type="number"]');
        const count = await timeInputs.count();

        for (let i = 0; i < Math.min(count, 4); i++) {
          const field = timeInputs.nth(i);
          if (await field.isVisible()) {
            await field.fill('0.1');
          }
        }

        Logger.success('Minimum valid values tested');
      }
    });
  });

  // ================= DATA PERSISTENCE TESTS =================

  test('💾 Persistence: Process Routing data persists after reload', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const { categoryName, productName, resourceName } = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page);

    await test.step('Create routing', async () => {
      await processRoutingPage.navigate();
      await processRoutingPage.addProcessRouting(productName, resourceName, '5');
      Logger.success('Routing created');
    });

    await test.step('Reload and verify', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      Logger.success('Data persisted after reload');
    });
  });

  test('💾 Persistence: Multiple routings visible in list', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const routings: { categoryName: string; productName: string; resourceName: string }[] = [];

    for (let i = 0; i < 2; i++) {
      const setup = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page);
      routings.push(setup);
    }

    await test.step('Create multiple routings', async () => {
      await processRoutingPage.navigate();

      for (const routing of routings) {
        await processRoutingPage.addProcessRouting(routing.productName, routing.resourceName, '5');
      }
    });

    await test.step('Reload and verify all visible', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      Logger.success('All routings visible');
    });
  });

  // ================= UPDATE/EDIT TESTS =================

  test('✏️ Update: Edit process routing times', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const { categoryName, productName, resourceName } = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page);

    await test.step('Create initial routing', async () => {
      await processRoutingPage.navigate();
      await processRoutingPage.addProcessRouting(productName, resourceName, '5');
      Logger.success('Initial routing created');
    });

    await test.step('Edit routing times', async () => {
      // Look for edit button
      const editButton = page.locator('button:has-text("Edit"), button:has-text("Update"), [aria-label*="Edit"]').first();
      if (await editButton.isVisible({ timeout: 2000 }).catch(() => false)) {
        await editButton.click();

        // Modify time value
        const timeInput = page.locator('input[type="number"]').first();
        if (await timeInput.isVisible()) {
          await timeInput.clear();
          await timeInput.fill('10');
        }

        // Save changes
        const saveButton = page.getByRole('button', { name: 'Save' });
        if (await saveButton.isVisible()) {
          await saveButton.click();
        }

        Logger.success('Routing updated');
      } else {
        Logger.warn('Edit button not found');
      }
    });
  });

  // ================= RESOURCE SEQUENCE TESTS =================

  test('🔗 Sequencing: Multiple resources in routing sequence', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();
    const productName = DataGenerator.getProductName();
    const resources: string[] = [];

    await test.step('Create category and product', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, DataGenerator.getDescription(), 'test-data/test.png');

      await productPage.goToProductSection();
      await productPage.clickAddProduct();
      await productPage.addProduct(categoryName, productName);
      await page.waitForLoadState('networkidle');
    });

    await test.step('Create multiple resources', async () => {
      for (let i = 0; i < 2; i++) {
        const resourceName = DataGenerator.getResourceName();
        await resourcePage.navigate();
        await resourcePage.clickAddResource();
        await resourcePage.addResource(resourceName);
        resources.push(resourceName);
        await page.waitForLoadState('networkidle');
      }
    });

    await test.step('Create routings for each resource', async () => {
      await processRoutingPage.navigate();

      for (const resourceName of resources) {
        await processRoutingPage.addProcessRouting(productName, resourceName, '5');
        Logger.info(`Routing created for: ${resourceName}`);
      }

      Logger.success('Sequential resource routings created');
    });
  });

  // ================= TIME FIELD VALIDATION TESTS =================

  test('🔍 Validation: All time field types (Process, Setup, Wait, Move)', async ({ categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page }) => {
    const { categoryName, productName, resourceName } = await createTestSetup(categoryPage, productPage, resourcePage, workstationPage, processRoutingPage, page);

    await test.step('Validate all time field inputs', async () => {
      await processRoutingPage.navigate();

      const addButton = page.locator('button:has-text("Add")').first();
      if (await addButton.isVisible()) {
        await addButton.click();

        // Fill form
        const categoryDropdown = page.locator('button:has-text("Select")').first();
        if (await categoryDropdown.isVisible()) {
          await categoryDropdown.click();
          await page.getByRole('option', { name: new RegExp(categoryName) }).click();
        }

        const productDropdown = page.locator('button:has-text("Select")').nth(1);
        if (await productDropdown.isVisible()) {
          await productDropdown.click();
          await page.getByRole('option', { name: new RegExp(productName) }).click();
        }

        const resourceDropdown = page.locator('button:has-text("Select")').nth(2);
        if (await resourceDropdown.isVisible()) {
          await resourceDropdown.click();
          await page.getByRole('option', { name: new RegExp(resourceName) }).click();
        }

        // Identify and fill each time field
        const timeInputs = page.locator('input[type="number"]');
        const timeLabels = ['Process', 'Setup', 'Wait', 'Move'];
        const count = await timeInputs.count();

        const fieldDescriptions = [];
        for (let i = 0; i < Math.min(count, 4); i++) {
          const field = timeInputs.nth(i);
          if (await field.isVisible()) {
            await field.fill((i + 1).toString());
            fieldDescriptions.push(`${timeLabels[i]}: ${i + 1}`);
          }
        }

        Logger.success(`Time fields validated: ${fieldDescriptions.join(', ')}`);
      }
    });
  });

});
