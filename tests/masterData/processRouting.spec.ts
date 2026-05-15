import { test } from '../fixtures/baseTest';
import { TestDataFactory } from '../utils/testDataFactory';
import { DataGenerator } from '../../utils/dataGenerator';

test.describe('Process Routing Module', () => {

  test('Create Process Routing', async ({
    categoryPage,
    productPage,
    resourcePage,
    processRoutingPage
  }) => {

    // Create Category
    await categoryPage.navigate();

    await categoryPage.clickAddCategory();

    await categoryPage.addCategory(
      TestDataFactory.categoryName,
      TestDataFactory.categoryDescription,
      'test-data/test.png'
    );

    // Create Product
    await productPage.goToProductSection();

    await productPage.clickAddProduct();

    await productPage.addProduct(
      TestDataFactory.categoryName,
      TestDataFactory.productName
    );

    // Create Resource
    await resourcePage.navigate();

    await resourcePage.clickAddResource();

    await resourcePage.addResource(
      TestDataFactory.resourceName
    );

    // Process Routing
    await processRoutingPage.navigate();

    await processRoutingPage.clickAddRouting();

    await processRoutingPage.validateEmptyForm();

    await processRoutingPage.selectProduct(
      TestDataFactory.productName
    );

    await processRoutingPage.selectResource(
      TestDataFactory.resourceName
    );

    const timeValue =
      DataGenerator.getRandomNumber(1, 10);

    await processRoutingPage.fillWorkstationTimes(
      timeValue
    );

    await processRoutingPage.submitRouting();

    await processRoutingPage.verifyRoutingCreated(
      TestDataFactory.productName
    );

  });

});