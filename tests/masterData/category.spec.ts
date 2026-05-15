import { test } from '../fixtures/baseTest';
import { Logger } from '../../utils/logger';
import { TestDataFactory } from '../utils/testDataFactory';

test.describe('Category Module', () => {

  test('Create Category', async ({ categoryPage, page }) => {

    await categoryPage.navigate();

    await page.waitForLoadState('networkidle');

    await categoryPage.clickAddCategory();

    await categoryPage.validateEmptyForm();

    await categoryPage.addCategory(
      TestDataFactory.categoryName,
      TestDataFactory.categoryDescription,
      'test-data/test.png'
    );

    await categoryPage.verifyCategoryCreated(
      TestDataFactory.categoryName
    );

    Logger.success('Category Created');

  });

});