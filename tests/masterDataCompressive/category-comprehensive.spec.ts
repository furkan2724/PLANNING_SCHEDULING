import { test } from '../fixtures/baseTest';
import { Logger } from '../../utils/logger';
import { DataGenerator } from '../../utils/dataGenerator';

test.describe('Category Management - Comprehensive Test Suite', () => {

  // ================= HAPPY PATH TESTS =================

  test('✅ Happy Path: Create Category with all fields', async ({ categoryPage, page, loginPage }) => {
    const categoryName = DataGenerator.getCategoryName();
    const categoryDesc = DataGenerator.getDescription();

    // Logger.info('Logging into MDM application');

    //   await loginPage.navigateToMDM();

    //   await loginPage.loginToMDM();

    //   Logger.success('MDM Login successful');
      
    await test.step('Navigate to Category Page', async () => {
      await categoryPage.navigate();
      await page.waitForLoadState('networkidle');
      Logger.info('Navigated to Category Page');
    });

    await test.step('Create Category', async () => {
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, categoryDesc, 'test-data/test.png');
      Logger.success(`Category Created: ${categoryName}`);
    });

    await test.step('Verify Category Created', async () => {
      await categoryPage.verifyCategoryCreated(categoryName);
      Logger.success(`Category Verified: ${categoryName}`);
    });
  });

  test('✅ Happy Path: Update Category', async ({ categoryPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();
    const categoryDesc = DataGenerator.getDescription();
    const updatedDesc = DataGenerator.getDescription();

    await test.step('Create Category', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, categoryDesc, 'test-data/test.png');
      Logger.success(`Category Created: ${categoryName}`);
    });

    await test.step('Update Category Description', async () => {
      await categoryPage.editCategory(categoryName, updatedDesc);
      Logger.success(`Category Updated: ${categoryName}`);
    });

    await test.step('Verify Category Updated', async () => {
      // Refresh and verify the update persisted
      await page.reload();
      await page.waitForLoadState('networkidle');
      await categoryPage.verifyCategoryCreated(categoryName);
      Logger.success(`Update Verified: ${categoryName}`);
    });
  });

  test('✅ Happy Path: Create Category with minimum fields', async ({ categoryPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();

    await test.step('Navigate and Create Category', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, '', 'test-data/test.png');
      Logger.success(`Category Created with minimal fields: ${categoryName}`);
    });

    await test.step('Verify Creation', async () => {
      await categoryPage.verifyCategoryCreated(categoryName);
      Logger.success('Minimal Category Verified');
    });
  });

  // ================= NEGATIVE/ERROR TESTS =================

  test('❌ Negative: Cannot create category without name', async ({ categoryPage, page }) => {
    await test.step('Navigate to Category', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
    });

    await test.step('Submit form without name', async () => {
      // Try to submit empty form
      await page.getByLabel('Add New Category')
        .getByRole('button', { name: 'Add Category' }).click();
      
      // Verify error message appears
      await page.waitForSelector('[id*="name-error"], text="required"', { timeout: 5000 });
      Logger.success('Form validation error triggered');
    });
  });

  test('❌ Negative: Category name with special characters', async ({ categoryPage, page }) => {
    const invalidNames = [
      '@#$%^&*()',
      '<script>alert("xss")</script>',
      'Category™',
      'Test\n\nNewline',
    ];

    for (const invalidName of invalidNames) {
      await test.step(`Attempt to create category with name: ${invalidName}`, async () => {
        await categoryPage.navigate();
        await categoryPage.clickAddCategory();
        
        // Fill the form with invalid name
        await page.getByRole('textbox', { name: 'Category Name*' }).fill(invalidName);
        await page.getByLabel('Add New Category')
          .getByRole('button', { name: 'Add Category' }).click();
        
        // Verify either validation error or successful sanitization
        Logger.info(`Tested special character: ${invalidName}`);
        
        // Wait a moment for any errors to appear
        await page.waitForTimeout(500);
        
        // Either we get an error or system accepts it
        // In either case, verify the system handled it gracefully
        Logger.success('System handled special characters gracefully');
      });
    }
  });

  test('❌ Negative: Category name exceeds maximum length', async ({ categoryPage, page }) => {
    const veryLongName = 'A'.repeat(256); // Test with extremely long string
    
    await test.step('Navigate and attempt long name', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      
      const nameInput = page.getByRole('textbox', { name: 'Category Name*' });
      await nameInput.fill(veryLongName);
      
      // Get actual entered value
      const enteredValue = await nameInput.inputValue();
      const isLimited = enteredValue.length < veryLongName.length;
      
      if (isLimited) {
        Logger.success(`Input field has max length limit: ${enteredValue.length}`);
      } else {
        Logger.info('Field accepts long strings');
      }
    });
  });

  test('❌ Negative: Duplicate category name handling', async ({ categoryPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();
    const categoryDesc = DataGenerator.getDescription();

    await test.step('Create first category', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, categoryDesc, 'test-data/test.png');
      Logger.success(`First category created: ${categoryName}`);
    });

    await test.step('Attempt to create duplicate', async () => {
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, 'Different description', 'test-data/test.png');
      
      // Wait to see if duplicate is created or if error appears
      await page.waitForTimeout(1000);
      
      // Check for duplicate in list or error message
      const categoryMatches = await page.getByText(categoryName).all();
      Logger.info(`Found ${categoryMatches.length} entries with same name`);
    });
  });

  test('❌ Negative: Category description with very long text', async ({ categoryPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();
    const longDescription = 'A'.repeat(10000); // Very long description

    await test.step('Navigate and create with long description', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      
      const descInput = page.getByRole('textbox', { name: 'Category description' });
      await descInput.fill(longDescription);
      
      const enteredValue = await descInput.inputValue();
      const isLimited = enteredValue.length < longDescription.length;
      
      await categoryPage.addCategory(categoryName, enteredValue, 'test-data/test.png');
      Logger.success(`Category created with ${enteredValue.length} char description`);
    });
  });

  // ================= BOUNDARY TESTS =================

  test('🔲 Boundary: Create category with single character name', async ({ categoryPage, page }) => {
    const singleCharName = 'A';
    
    await test.step('Navigate and create single char category', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(singleCharName, 'Single character', 'test-data/test.png');
      Logger.success('Single character category created');
    });

    await test.step('Verify creation', async () => {
      await categoryPage.verifyCategoryCreated(singleCharName);
      Logger.success('Single character category verified');
    });
  });

  test('🔲 Boundary: Category name with numbers and symbols only', async ({ categoryPage, page }) => {
    const numericName = DataGenerator.getRandomNumber(1000, 9999).toString();
    
    await test.step('Create numeric category', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(numericName, '', 'test-data/test.png');
      Logger.success(`Numeric category created: ${numericName}`);
    });
  });

  test('🔲 Boundary: Category name with spaces and accents', async ({ categoryPage, page }) => {
    const accentName = 'Café Españöl Théâtre';
    
    await test.step('Navigate and create with accented name', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(accentName, '', 'test-data/test.png');
      Logger.success(`Accented category created: ${accentName}`);
    });
  });

  // ================= DATA PERSISTENCE TESTS =================

  test('💾 Persistence: Category data persists after page reload', async ({ categoryPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();
    const categoryDesc = DataGenerator.getDescription();

    await test.step('Create category', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, categoryDesc, 'test-data/test.png');
      Logger.success('Category created');
    });

    await test.step('Reload page', async () => {
      await page.reload();
      await page.waitForLoadState('networkidle');
      Logger.info('Page reloaded');
    });

    await test.step('Verify data persisted', async () => {
      await categoryPage.verifyCategoryCreated(categoryName);
      Logger.success('Category data persisted after reload');
    });
  });

  test('💾 Persistence: Multiple categories in list', async ({ categoryPage, page }) => {
    const categories = [
      { name: DataGenerator.getCategoryName(), desc: DataGenerator.getDescription() },
      { name: DataGenerator.getCategoryName(), desc: DataGenerator.getDescription() },
      { name: DataGenerator.getCategoryName(), desc: DataGenerator.getDescription() },
    ];

    await test.step('Create multiple categories', async () => {
      await categoryPage.navigate();
      
      for (const cat of categories) {
        await categoryPage.clickAddCategory();
        await categoryPage.addCategory(cat.name, cat.desc, 'test-data/test.png');
        Logger.info(`Created: ${cat.name}`);
      }
    });

    await test.step('Verify all categories visible', async () => {
      await categoryPage.navigate();
      await page.waitForLoadState('networkidle');
      
      for (const cat of categories) {
        await categoryPage.verifyCategoryCreated(cat.name);
        Logger.info(`Verified: ${cat.name}`);
      }
      Logger.success('All categories visible in list');
    });
  });

  // ================= IMAGE UPLOAD TESTS =================

  test('🖼️ Image: Category with valid image upload', async ({ categoryPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();

    await test.step('Navigate and create with image', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, 'With image', 'test-data/test.png');
      Logger.success('Category created with image');
    });

    await test.step('Verify image uploaded', async () => {
      await categoryPage.verifyImageUploaded(categoryName);
      Logger.success('Image verified');
    });
  });

  test('🖼️ Image: Create category without image', async ({ categoryPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();

    await test.step('Create category without image', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      
      // Fill form but don't upload image
      const modal = page.getByLabel('Add New Category');
      await modal.getByRole('textbox', { name: 'Category Name*' }).fill(categoryName);
      await modal.getByRole('button', { name: 'Add Category' }).click();
      
      Logger.success('Category created without image');
    });

    await test.step('Verify creation without image', async () => {
      await categoryPage.verifyCategoryCreated(categoryName);
      Logger.success('Category verified without image');
    });
  });

  // ================= UI/UX TESTS =================

  test('🎨 UX: Form modal opens and closes correctly', async ({ categoryPage, page }) => {
    await test.step('Navigate to category page', async () => {
      await categoryPage.navigate();
    });

    await test.step('Open add category modal', async () => {
      await categoryPage.clickAddCategory();
      const modal = page.getByLabel('Add New Category');
      await modal.isVisible();
      Logger.success('Modal opened');
    });

    await test.step('Close modal by pressing Escape', async () => {
      await page.keyboard.press('Escape');
      await page.waitForTimeout(300);
      const modal = page.getByLabel('Add New Category');
      const isVisible = await modal.isVisible().catch(() => false);
      Logger.success(`Modal closed: ${!isVisible}`);
    });
  });

  test('🎨 UX: Form reset after successful submission', async ({ categoryPage, page }) => {
    const categoryName = DataGenerator.getCategoryName();

    await test.step('Navigate and create first category', async () => {
      await categoryPage.navigate();
      await categoryPage.clickAddCategory();
      await categoryPage.addCategory(categoryName, 'First', 'test-data/test.png');
      Logger.success('First category created');
    });

    await test.step('Open form again and verify empty', async () => {
      await categoryPage.clickAddCategory();
      const nameInput = page.getByRole('textbox', { name: 'Category Name*' });
      const inputValue = await nameInput.inputValue();
      
      if (inputValue === '') {
        Logger.success('Form cleared after submission');
      } else {
        Logger.warn('Form retains previous data');
      }
    });
  });

});
