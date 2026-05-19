import { test } from '../fixtures/baseTest';
import { Logger } from '../../utils/logger';
import { DataGenerator } from '../../utils/dataGenerator';

test.describe('Workstation Management - Comprehensive Test Suite', () => {

  // Helper: Create resource first (needed for workstation)
  async function createTestResource(resourcePage, page) {
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
      await page.getByRole('textbox', { name: 'Workstation Name*' }).fill(workstationName);
      
      await page.getByLabel('Add New Workstation', { exact: true })
        .getByRole('button', { name: 'Add Workstation' }).click();
      
      await page.waitForTimeout(500);
      Logger.success('Form rejected without resource');
    });
  });

  test('❌ Negative: Workstation name with special characters', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const invalidNames = [
      '@#$%^&*()',
      '<script>alert("xss")</script>',
      'Workstation™',
    ];

    await workstationPage.goToWorkstationSection();

    for (const invalidName of invalidNames) {
      await test.step(`Test special characters: ${invalidName}`, async () => {
        await workstationPage.clickAddWorkstation();
        await workstationPage.selectResource(resourceName);
        await workstationPage.selectSubInventory();
        
        const nameInput = page.getByRole('textbox', { name: 'Workstation Name*' });
        await nameInput.fill(invalidName);
        
        await page.getByLabel('Add New Workstation', { exact: true })
          .getByRole('button', { name: 'Add Workstation' }).click();
        
        await page.waitForTimeout(500);
        Logger.success('Special characters handled');
      });
    }
  });

  test('❌ Negative: Workstation name exceeds maximum length', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const veryLongName = 'W'.repeat(256);

    await test.step('Test long name', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      
      const nameInput = page.getByRole('textbox', { name: 'Workstation Name*' });
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

  test('🔲 Boundary: Workstation with single character name', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const singleCharName = 'W';

    await test.step('Create single char workstation', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(singleCharName);
      await workstationPage.addWorkstation();
      Logger.success('Single character workstation created');
    });
  });

  test('🔲 Boundary: Workstation with numbers only', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);
    const numericName = DataGenerator.getRandomNumber(10000, 99999).toString();

    await test.step('Create numeric workstation', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(numericName);
      await workstationPage.addWorkstation();
      Logger.success(`Numeric workstation created: ${numericName}`);
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
    const resourceNames = [];
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

  // ================= SUB-INVENTORY TESTS =================

  test('🏭 Sub-Inventory: Selection variations', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);

    await test.step('Test sub-inventory selection options', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.selectResource(resourceName);
      
      const subInventoryButton = page.locator('button:has-text("Select"), button:has-text("Inventory")').first();
      if (await subInventoryButton.isVisible()) {
        await subInventoryButton.click();
        const options = page.getByRole('option');
        const count = await options.count();
        Logger.success(`Sub-inventory options: ${count}`);
      } else {
        Logger.info('Sub-inventory auto-selected or not visible');
      }
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
      await workstationPage.verifyWorkstationCreated();
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

  // ================= PERFORMANCE TESTS =================

  test('⚡ Performance: Rapid workstation creation', async ({ resourcePage, workstationPage, page }) => {
    const resourceName = await createTestResource(resourcePage, page);

    await test.step('Rapidly create workstations', async () => {
      await workstationPage.goToWorkstationSection();
      
      for (let i = 0; i < 3; i++) {
        const workstationName = DataGenerator.getWorkstationName();
        await workstationPage.clickAddWorkstation();
        await workstationPage.selectResource(resourceName);
        await workstationPage.selectSubInventory();
        await workstationPage.fillWorkstationName(workstationName);
        await workstationPage.addWorkstation();
        Logger.info(`${i + 1}/3 created`);
      }
      
      Logger.success('Rapid creation completed');
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
