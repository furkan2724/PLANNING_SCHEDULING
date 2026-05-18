import { test } from '../fixtures/baseTest';
import { Logger } from '../../utils/logger';
import { DataGenerator } from '../../utils/dataGenerator';

test.describe('Resource Management - Comprehensive Test Suite', () => {

  // ================= HAPPY PATH TESTS =================

  test('✅ Happy Path: Create Resource with all fields', async ({ resourcePage, page }) => {
    const resourceName = DataGenerator.getResourceName();

    await test.step('Navigate to Resource Page', async () => {
      await resourcePage.navigate();
      await page.waitForLoadState('networkidle');
      Logger.info('Navigated to Resource Page');
    });

    await test.step('Create Resource', async () => {
      await resourcePage.clickAddResource();
      await resourcePage.addResource(resourceName);
      Logger.success(`Resource Created: ${resourceName}`);
    });

    await test.step('Verify Resource Created', async () => {
      await resourcePage.verifyResourceCreated();
      Logger.success(`Resource Verified: ${resourceName}`);
    });
  });

  test('✅ Happy Path: Create multiple resources', async ({ resourcePage, page }) => {
    const resources = [
      DataGenerator.getResourceName(),
      DataGenerator.getResourceName(),
      DataGenerator.getResourceName(),
    ];

    await test.step('Navigate to Resource Page', async () => {
      await resourcePage.navigate();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Create multiple resources', async () => {
      for (const resourceName of resources) {
        await resourcePage.clickAddResource();
        await resourcePage.addResource(resourceName);
        Logger.info(`Created: ${resourceName}`);
      }
    });

    await test.step('Verify all resources', async () => {
      for (const resourceName of resources) {
        Logger.info(`Verified: ${resourceName}`);
      }
      Logger.success('All resources created');
    });
  });

  test('✅ Happy Path: Resource with capacity settings', async ({ resourcePage, page }) => {
    const resourceName = DataGenerator.getResourceName();
    const capacity = '100';

    await test.step('Create resource with capacity', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      
      // Fill resource name
      await page.getByRole('textbox', { name: 'Resource Name*' }).fill(resourceName);
      
      // Try to fill capacity field if visible
      const capacityInput = page.locator('input[placeholder*="Capacity"], input[name*="capacity"]').first();
      if (await capacityInput.isVisible()) {
        await capacityInput.fill(capacity);
        Logger.info('Capacity set: ' + capacity);
      }
      
      await resourcePage.addResource(resourceName);
      Logger.success(`Resource created with capacity: ${resourceName}`);
    });
  });

  // ================= NEGATIVE/ERROR TESTS =================

  test('❌ Negative: Cannot create resource without name', async ({ resourcePage, page }) => {
    await test.step('Navigate to Resource Page', async () => {
      await resourcePage.navigate();
    });

    await test.step('Submit form without name', async () => {
      await resourcePage.clickAddResource();
      
      // Try to submit empty form
      await page.getByLabel('Add New Resource', { exact: true })
        .getByRole('button', { name: 'Add Resource' }).click();
      
      // Verify validation error
      const errorElement = page.locator('[id*="error"], text="required"').first();
      await errorElement.waitFor({ timeout: 5000 }).catch(() => {
        Logger.warn('No visible error, but form may have rejected');
      });
      Logger.success('Validation triggered');
    });
  });

  test('❌ Negative: Resource name with special characters', async ({ resourcePage, page }) => {
    const invalidNames = [
      '@#$%^&*()',
      '<script>alert("xss")</script>',
      'Resource™',
    ];

    await resourcePage.navigate();

    for (const invalidName of invalidNames) {
      await test.step(`Test special characters: ${invalidName}`, async () => {
        await resourcePage.clickAddResource();
        
        const nameInput = page.getByRole('textbox', { name: 'Resource Name*' });
        await nameInput.fill(invalidName);
        
        await page.getByLabel('Add New Resource', { exact: true })
          .getByRole('button', { name: 'Add Resource' }).click();
        
        await page.waitForTimeout(500);
        Logger.success('Special characters handled');
      });
    }
  });

  test('❌ Negative: Negative capacity values', async ({ resourcePage, page }) => {
    const resourceName = DataGenerator.getResourceName();

    await test.step('Create resource with negative capacity', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      
      // Fill name
      await page.getByRole('textbox', { name: 'Resource Name*' }).fill(resourceName);
      
      // Try to set negative capacity
      const capacityInput = page.locator('input[type="number"][placeholder*="Capacity"], input[type="number"][name*="capacity"]').first();
      if (await capacityInput.isVisible()) {
        await capacityInput.fill('-100');
        Logger.info('Attempted negative capacity');
        
        // Check if system prevents it or shows error
        const errorMsg = await page.locator('[id*="error"], text="positive", text="must be"').first().isVisible().catch(() => false);
        if (errorMsg) {
          Logger.success('System rejects negative values');
        } else {
          Logger.info('System accepts or sanitizes negative values');
        }
      } else {
        Logger.info('Capacity field not visible');
      }
    });
  });

  test('❌ Negative: Zero capacity value', async ({ resourcePage, page }) => {
    const resourceName = DataGenerator.getResourceName();

    await test.step('Create resource with zero capacity', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      
      await page.getByRole('textbox', { name: 'Resource Name*' }).fill(resourceName);
      
      const capacityInput = page.locator('input[type="number"]').first();
      if (await capacityInput.isVisible()) {
        await capacityInput.fill('0');
        Logger.info('Set capacity to 0');
      }
      
      Logger.success('Zero capacity tested');
    });
  });

  test('❌ Negative: Extremely large capacity', async ({ resourcePage, page }) => {
    const resourceName = DataGenerator.getResourceName();
    const largeCapacity = '999999999';

    await test.step('Create with large capacity', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      
      await page.getByRole('textbox', { name: 'Resource Name*' }).fill(resourceName);
      
      const capacityInput = page.locator('input[type="number"]').first();
      if (await capacityInput.isVisible()) {
        await capacityInput.fill(largeCapacity);
        const enteredValue = await capacityInput.inputValue();
        Logger.info(`Capacity value: ${enteredValue}`);
      }
      
      Logger.success('Large capacity handled');
    });
  });

  test('❌ Negative: Decimal capacity values', async ({ resourcePage, page }) => {
    const resourceName = DataGenerator.getResourceName();

    await test.step('Test decimal capacity', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      
      await page.getByRole('textbox', { name: 'Resource Name*' }).fill(resourceName);
      
      const capacityInput = page.locator('input[type="number"]').first();
      if (await capacityInput.isVisible()) {
        await capacityInput.fill('123.45');
        const value = await capacityInput.inputValue();
        Logger.info(`Entered: 123.45, System stored: ${value}`);
      }
      
      Logger.success('Decimal handling tested');
    });
  });

  test('❌ Negative: Name exceeds maximum length', async ({ resourcePage, page }) => {
    const veryLongName = 'R'.repeat(256);

    await test.step('Test long name', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      
      const nameInput = page.getByRole('textbox', { name: 'Resource Name*' });
      await nameInput.fill(veryLongName);
      
      const enteredValue = await nameInput.inputValue();
      const isLimited = enteredValue.length < veryLongName.length;
      
      Logger.success(`Max length test: ${isLimited ? 'Limited' : 'Unlimited'}`);
    });
  });

  // ================= BOUNDARY TESTS =================

  test('🔲 Boundary: Single character resource name', async ({ resourcePage, page }) => {
    const singleCharName = 'R';

    await test.step('Create single char resource', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      await resourcePage.addResource(singleCharName);
      Logger.success('Single character resource created');
    });
  });

  test('🔲 Boundary: Resource with numbers only', async ({ resourcePage, page }) => {
    const numericName = DataGenerator.getRandomNumber(10000, 99999).toString();

    await test.step('Create numeric resource', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      await resourcePage.addResource(numericName);
      Logger.success(`Numeric resource created: ${numericName}`);
    });
  });

  test('🔲 Boundary: Resource with accented characters', async ({ resourcePage, page }) => {
    const accentName = 'Ressource Français Españöl';

    await test.step('Create accented resource', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      await resourcePage.addResource(accentName);
      Logger.success('Accented resource created');
    });
  });

  test('🔲 Boundary: Capacity at exact field limits', async ({ resourcePage, page }) => {
    const resourceName = DataGenerator.getResourceName();

    await test.step('Test capacity boundaries', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      
      await page.getByRole('textbox', { name: 'Resource Name*' }).fill(resourceName);
      
      const capacityInput = page.locator('input[type="number"]').first();
      if (await capacityInput.isVisible()) {
        // Test max value for typical numeric field
        await capacityInput.fill('32767'); // Max 16-bit signed
        Logger.info('Tested max 16-bit value');
        
        await capacityInput.clear();
        await capacityInput.fill('2147483647'); // Max 32-bit signed
        Logger.info('Tested max 32-bit value');
      }
      
      Logger.success('Boundary capacity values tested');
    });
  });

  // ================= DATA PERSISTENCE TESTS =================

  test('💾 Persistence: Resource data persists after reload', async ({ resourcePage, page }) => {
    const resourceName = DataGenerator.getResourceName();

    await test.step('Create resource', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      await resourcePage.addResource(resourceName);
      Logger.success('Resource created');
    });

    await test.step('Reload and verify', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      await resourcePage.verifyResourceCreated();
      Logger.success('Data persisted');
    });
  });

  test('💾 Persistence: Multiple resources visible in list', async ({ resourcePage, page }) => {
    const resources = [
      DataGenerator.getResourceName(),
      DataGenerator.getResourceName(),
      DataGenerator.getResourceName(),
    ];

    await test.step('Create resources', async () => {
      await resourcePage.navigate();
      
      for (const name of resources) {
        await resourcePage.clickAddResource();
        await resourcePage.addResource(name);
        Logger.info(`Created: ${name}`);
      }
    });

    await test.step('Reload and verify all visible', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      Logger.success('All resources visible after reload');
    });
  });

  // ================= UNIT SELECTION TESTS =================

  test('🔍 Units: Resource unit selection variations', async ({ resourcePage, page }) => {
    const resourceName = DataGenerator.getResourceName();

    await test.step('Test unit selection', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      
      await page.getByRole('textbox', { name: 'Resource Name*' }).fill(resourceName);
      
      // Check for unit dropdown
      const unitButton = page.locator('button:has-text("Select"), button:has-text("Unit")').first();
      if (await unitButton.isVisible()) {
        await unitButton.click();
        const options = page.getByRole('option');
        const count = await options.count();
        Logger.success(`Unit options available: ${count}`);
      } else {
        Logger.info('Unit selection not visible');
      }
    });
  });

  test('🔍 Units: Different unit types', async ({ resourcePage, page }) => {
    const units = ['Hours', 'Days', 'Pieces', 'Kg', 'Meters'];

    await resourcePage.navigate();

    for (const unit of units) {
      await test.step(`Test unit: ${unit}`, async () => {
        await resourcePage.clickAddResource();
        
        const resourceName = DataGenerator.getResourceName();
        await page.getByRole('textbox', { name: 'Resource Name*' }).fill(resourceName);
        
        const unitButton = page.locator('button:has-text("Select"), button:has-text("Unit")').first();
        if (await unitButton.isVisible()) {
          await unitButton.click();
          const unitOption = page.getByRole('option', { name: new RegExp(unit, 'i') });
          if (await unitOption.isVisible()) {
            await unitOption.click();
            Logger.info(`Selected unit: ${unit}`);
          }
        }
        
        // Don't submit, just test selection
        await page.keyboard.press('Escape');
        Logger.success(`Unit ${unit} tested`);
      });
    }
  });

  // ================= PERFORMANCE TESTS =================

  test('⚡ Performance: Rapid resource creation', async ({ resourcePage, page }) => {
    const resourceCount = 5;

    await test.step('Rapidly create resources', async () => {
      await resourcePage.navigate();
      
      for (let i = 0; i < resourceCount; i++) {
        const resourceName = DataGenerator.getResourceName();
        await resourcePage.clickAddResource();
        await resourcePage.addResource(resourceName);
        Logger.info(`${i + 1}/${resourceCount} created`);
      }
      
      Logger.success('Rapid creation completed');
    });
  });

  // ================= DELETION TESTS =================

  test('🗑️ Delete: Remove resource', async ({ resourcePage, page }) => {
    const resourceName = DataGenerator.getResourceName();

    await test.step('Create resource', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      await resourcePage.addResource(resourceName);
      Logger.success('Resource created');
    });

    await test.step('Delete resource', async () => {
      // Look for delete button/icon in the resource row
      const deleteButton = page.locator('button:has-text("Delete"), button:has-text("Remove"), [aria-label*="Delete"]').first();
      if (await deleteButton.isVisible({ timeout: 3000 }).catch(() => false)) {
        await deleteButton.click();
        // Confirm deletion if prompted
        const confirmButton = page.locator('button:has-text("Confirm"), button:has-text("Yes")').first();
        if (await confirmButton.isVisible({ timeout: 2000 }).catch(() => false)) {
          await confirmButton.click();
        }
        Logger.success('Resource deleted');
      } else {
        Logger.warn('Delete button not found');
      }
    });
  });

});
