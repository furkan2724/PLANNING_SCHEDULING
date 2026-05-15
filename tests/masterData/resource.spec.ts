import { test } from '../fixtures/baseTest';
import { TestDataFactory } from '../utils/testDataFactory';

test.describe('Resource Module', () => {

  test('Create Resource', async ({ resourcePage }) => {

    await resourcePage.navigate();

    await resourcePage.clickAddResource();

    await resourcePage.addResource(
      TestDataFactory.resourceName
    );

    await resourcePage.verifyResourceCreated();

  });

});