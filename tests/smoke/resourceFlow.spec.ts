import { test } from '../fixtures/test-fixtures';
import { DataGenerator } from '../../utils/dataGenerator';

test.describe('E2E - Resource Flow', () => {

  test('Create Resource → Workstation', async ({
    resourcePage,
    workstationPage
  }) => {

    const resourceName = DataGenerator.getResourceName();
    const workstationName = DataGenerator.getWorkstationName();

    await test.step('🟣 Resource', async () => {
      await resourcePage.navigate();
      await resourcePage.clickAddResource();
      await resourcePage.validateEmptyForm();
      await resourcePage.addResource(resourceName);
      await resourcePage.verifyResourceCreated();
    });

    await test.step('🏭 Workstation', async () => {
      await workstationPage.goToWorkstationSection();
      await workstationPage.clickAddWorkstation();
      await workstationPage.validateEmptyForm();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(workstationName);
      await workstationPage.addWorkstation();
      await workstationPage.verifyWorkstationCreated();
    });

  });
});