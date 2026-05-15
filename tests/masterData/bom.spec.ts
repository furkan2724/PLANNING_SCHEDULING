import { test } from '../fixtures/baseTest';
import { TestDataFactory } from '../utils/testDataFactory';

test.describe('BOM Module', () => {

  test('Create BOM', async ({
    categoryPage,
    productPage,
    bomPage
  }) => {

    await categoryPage.navigate();

    await categoryPage.clickAddCategory();

    await categoryPage.addCategory(
      TestDataFactory.categoryName,
      TestDataFactory.categoryDescription,
      'test-data/test.png'
    );

    await productPage.goToProductSection();

    await productPage.clickAddProduct();

    await productPage.addProduct(
      TestDataFactory.categoryName,
      TestDataFactory.productName
    );

    await bomPage.navigateToBOM();

    await bomPage.clickCreateBOM();

    await bomPage.selectCategory(
      TestDataFactory.categoryName
    );

    await bomPage.selectProduct(
      TestDataFactory.productName
    );

    await bomPage.createBOM();

    await bomPage.verifyBOMCreated(
      TestDataFactory.categoryName,
      TestDataFactory.productName
    );

  });

});