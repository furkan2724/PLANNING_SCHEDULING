import { test } from '../fixtures/baseTest';
import { TestDataFactory } from '../utils/testDataFactory';

test.describe('Workstation Module', () => {

  test('Create Workstation', async ({
    resourcePage,
    workstationPage
  }) => {

    await resourcePage.navigate();

    await resourcePage.clickAddResource();

    await resourcePage.addResource(
      TestDataFactory.resourceName
    );

    await workstationPage.goToWorkstationSection();

    await workstationPage.clickAddWorkstation();

    await workstationPage.selectResource(
      TestDataFactory.resourceName
    );

    await workstationPage.selectSubInventory();

    await workstationPage.fillWorkstationName(
      TestDataFactory.workstationName
    );

    await workstationPage.addWorkstation();

    await workstationPage.verifyWorkstationCreated();

  });

});