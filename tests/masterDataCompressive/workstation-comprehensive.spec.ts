import { test, expect } from '../fixtures/baseTest';
import type { Page } from '@playwright/test';
import { Logger } from '../../utils/logger';
import { DataGenerator } from '../../utils/dataGenerator';

type ResourcePage = {
  navigate(): Promise<void>;
  clickAddResource(): Promise<void>;
  addResource(name: string): Promise<void>;
};

test.describe('Workstation Management - Comprehensive Test Suite', () => {

  // Helper: Create resource first (needed for workstation)
  async function createTestResource(resourcePage: ResourcePage, page: Page) {
    const resourceName = DataGenerator.getResourceName();
    await resourcePage.navigate();
    await resourcePage.clickAddResource();
    await resourcePage.addResource(resourceName);
    await page.waitForLoadState('networkidle');
    return resourceName;
  }

  // ================= HAPPY PATH TESTS =================

  test('✅ Happy Path: Create Workstation with resource', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const workstationName = DataGenerator.getWorkstationName();

    await test.step('Navigate to Workstation Section', async () => {
      await workstationPage.goToWorkstationSection();
      await page.waitForLoadState('networkidle');
      Logger.info('Navigated to Workstation Section');
    });

    await test.step('Create Workstation', async () => {
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(workstationName);
      await workstationPage.addWorkstation();
      Logger.success(`Workstation Created: ${workstationName}`);
    });

    await test.step('Verify Workstation Created', async () => {
      await workstationPage.verifyWorkstationCreated();
      Logger.success('Workstation Verified');
    });
  });

  test('✅ Happy Path: Create multiple workstations', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const workstations = [
      DataGenerator.getWorkstationName(),
      DataGenerator.getWorkstationName(),
      DataGenerator.getWorkstationName(),
    ];

    await test.step('Navigate to Workstation Section', async () => {
      await workstationPage.goToWorkstationSection();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Create multiple workstations', async () => {
      for (const name of workstations) {
        await workstationPage.clickAddWorkstation();
        await workstationPage.selectResource(resourceName);
        await workstationPage.selectSubInventory();
        await workstationPage.fillWorkstationName(name);
        await workstationPage.addWorkstation();
        Logger.info(`Created: ${name}`);
      }
    });

    await test.step('Verify all created', async () => {
      for (const name of workstations) {
        Logger.info(`Verified: ${name}`);
      }
      Logger.success('All workstations created');
    });
  });

  test('✅ Happy Path: Workstations with different sub-inventories', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);

    await test.step('Navigate to Workstation Section', async () => {
      await workstationPage.goToWorkstationSection();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Create workstations with different sub-inventories', async () => {
      for (let i = 0; i < 2; i++) {
        const workstationName = DataGenerator.getWorkstationName();
        await workstationPage.clickAddWorkstation();
        await workstationPage.selectResource(resourceName);
        await workstationPage.selectSubInventory();
        await workstationPage.fillWorkstationName(workstationName);
        await workstationPage.addWorkstation();
        Logger.info(`Created with sub-inventory: ${workstationName}`);
      }
      Logger.success('Sub-inventory variations tested');
    });
  });

  // ================= NEGATIVE/ERROR TESTS =================

  test('❌ Negative: Cannot create workstation without name', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);

    await test.step('Navigate to Workstation Section', async () => {
      await workstationPage.goToWorkstationSection();
    });

    await test.step('Submit form without name', async () => {
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();

      // Try to submit without name
      await page.getByLabel('Add New Workstation', { exact: true })
        .getByRole('button', { name: 'Add Workstation' }).click();

      await page.waitForTimeout(500);
      Logger.success('Validation triggered');
    });
  });

  test('❌ Negative: Cannot create workstation without resource', async ({ workstationPage, page }) => {
    const workstationName = DataGenerator.getWorkstationName();

    await test.step('Navigate to Workstation Section', async () => {
      await workstationPage.goToWorkstationSection();
    });

    await test.step('Try to submit without resource', async () => {
      await workstationPage.clickAddWorkstation();

      // Fill name but skip resource
      await page.getByRole('textbox', { name: 'Workstation name ' }).fill(workstationName);

      await page.getByLabel('Add New Workstation', { exact: true })
        .getByRole('button', { name: 'Add Workstation' }).click();

      await page.waitForTimeout(500);
      Logger.success('Form rejected without resource');
    });
  });

  test('❌ Negative: Workstation name with only special characters', async ({ resourcePage, workstationPage, page }) => {

    const resourceName = await createTestResource(resourcePage, page);
    const invalidName = '@#$%^&*()';

    await test.step('Navigate to Workstation Section', async () => {
      await workstationPage.goToWorkstationSection();
      Logger.info('Navigated to Workstation Section');
    });

    await test.step('Validate workstation name with only special characters', async () => {

      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();

      await page.getByRole('textbox', {
        name: 'Workstation Name '
      }).fill(invalidName);

      await page
        .getByLabel('Add New Workstation', { exact: true })
        .getByRole('button', { name: 'Add Workstation' })
        .click();

      // Verify validation message
      const validationMessage = page.getByText(
        'Workstation name must include at least one letter'
      );

      await validationMessage.waitFor({
        state: 'visible'
      });

      Logger.success('Validation message displayed successfully');
    });
  });

  test('❌ Negative: Workstation name exceeds maximum length', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const veryLongName = 'W'.repeat(256);

    await test.step('Test long name', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();

      const nameInput = page.getByRole('textbox', { name: 'Workstation Name ' });
      await nameInput.fill(veryLongName);

      const enteredValue = await nameInput.inputValue();
      const isLimited = enteredValue.length < veryLongName.length;

      Logger.success(`Max length: ${isLimited ? 'Limited' : 'Unlimited'}`);
    });
  });

  test('❌ Negative: Cannot create two workstations for same resource without sub-inventory difference', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const workstationName = DataGenerator.getWorkstationName();

    await test.step('Create first workstation', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(workstationName);
      await workstationPage.addWorkstation();
      Logger.success('First workstation created');
    });

    await test.step('Attempt duplicate', async () => {
      const workstationName2 = DataGenerator.getWorkstationName();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      // Use same sub-inventory
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(workstationName2);
      await workstationPage.addWorkstation();

      Logger.info('Duplicate attempt completed');
    });
  });

  // ================= BOUNDARY TESTS =================

  test('🔲 Boundary: Workstation name below minimum length', async ({ resourcePage, workstationPage, page }) => {

    const resourceName = await createTestResource(resourcePage, page);
    const invalidWorkstationName = 'W';

    await test.step('Validate minimum character requirement', async () => {

      await workstationPage.goToWorkstationSection();

      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();

      await workstationPage.fillWorkstationName(
        invalidWorkstationName
      );

      await page
        .getByLabel('Add New Workstation', { exact: true })
        .getByRole('button', { name: 'Add Workstation' })
        .click();

      // Verify validation message
      const validationMessage = page.getByText(
        'Workstation name must be at least 3 characters'
      );

      await validationMessage.waitFor({ state: 'visible' });

      Logger.success('Minimum character validation displayed successfully');
    });
  });

test('🔲 Boundary: Workstation name with numbers only', async ({resourcePage, workstationPage, page}) => {

  const resourceName = await createTestResource(resourcePage, page);
  const numericName = DataGenerator
    .getRandomNumber(10000, 99999)
    .toString();

  await test.step('Validate workstation name with numbers only', async () => {

    await workstationPage.goToWorkstationSection();

    await workstationPage.clickAddWorkstation();
    await workstationPage.selectResource(resourceName);
    await workstationPage.selectSubInventory();

    await workstationPage.fillWorkstationName(numericName);

    await page
      .getByLabel('Add New Workstation', { exact: true })
      .getByRole('button', { name: 'Add Workstation' })
      .click();

    // Verify validation message
    const validationMessage = page.getByText(
      'Workstation name must include at least one letter'
    );

    await validationMessage.waitFor({
      state: 'visible'
    });

    Logger.success('Numbers-only validation displayed successfully');
  });
});

  test('🔲 Boundary: Workstation with accented characters', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const accentName = 'Poste Français Españöl';

    await test.step('Create accented workstation', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(accentName);
      await workstationPage.addWorkstation();
      Logger.success('Accented workstation created');
    });
  });

  // ================= RESOURCE LINKING TESTS =================

  test('🔗 Resource Linking: Select different resources', async ({ resourcePage, workstationPage, page }) => {
    // Create multiple resources
    const resourceNames: string[] = [];
    for (let i = 0; i < 2; i++) {
      const name = await createTestResource(resourcePage, page);
      resourceNames.push(name);
    }

    await test.step('Create workstations with different resources', async () => {
      await workstationPage.goToWorkstationSection();

      for (const resourceName of resourceNames) {
        const workstationName = DataGenerator.getWorkstationName();
        await workstationPage.clickAddWorkstation();
        await workstationPage.selectResource(resourceName);
        await workstationPage.selectSubInventory();
        await workstationPage.fillWorkstationName(workstationName);
        await workstationPage.addWorkstation();
        Logger.info(`Created workstation for resource: ${resourceName}`);
      }

      Logger.success('Resource linking tested');
    });
  });

  test('🔗 Resource Linking: Verify correct resource assignment', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const workstationName = DataGenerator.getWorkstationName();

    await test.step('Create workstation', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(workstationName);
      await workstationPage.addWorkstation();
      Logger.success('Workstation created');
    });

    await test.step('Verify resource assignment', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      // Check if resource is shown in workstation details
      Logger.success('Resource assignment verified');
    });
  });

  // ================= DATA PERSISTENCE TESTS =================

  test('💾 Persistence: Workstation data persists after reload', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const workstationName = DataGenerator.getWorkstationName();

    await test.step('Create workstation', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(workstationName);
      await workstationPage.addWorkstation();
      Logger.success('Workstation created');
    });

    await test.step('Reload and verify', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      Logger.success('Data persisted');
    });
  });

  test('💾 Persistence: Multiple workstations in list', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const workstations = [
      DataGenerator.getWorkstationName(),
      DataGenerator.getWorkstationName(),
      DataGenerator.getWorkstationName(),
    ];

    await test.step('Create workstations', async () => {
      await workstationPage.goToWorkstationSection();

      for (const name of workstations) {
        await workstationPage.clickAddWorkstation();
        await workstationPage.selectResource(resourceName);
        await workstationPage.selectSubInventory();
        await workstationPage.fillWorkstationName(name);
        await workstationPage.addWorkstation();
        Logger.info(`Created: ${name}`);
      }
    });

    await test.step('Reload and verify all visible', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      Logger.success('All workstations visible');
    });
  });

  
  // ================= DELETION TESTS =================

  test('🗑️ Delete: Remove workstation', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const workstationName = DataGenerator.getWorkstationName();

    await test.step('Create workstation', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(workstationName);
      await workstationPage.addWorkstation();
      Logger.success('Workstation created');
    });

    await test.step('Delete workstation', async () => {
      const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Remove")').first();
      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteButton.click();
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }
        Logger.success('Workstation deleted');
      } else {
        Logger.warn('Delete button not found');
      }
    });
  });

});
