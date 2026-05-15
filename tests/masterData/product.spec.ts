import { test } from '../fixtures/baseTest';
import { TestDataFactory } from '../utils/testDataFactory';

test.describe('Product Module', () => {

  test('Create Product', async ({
    categoryPage,
    productPage,
    page
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

    await productPage.verifyProductCreated(
      TestDataFactory.productName
    );

  });

});