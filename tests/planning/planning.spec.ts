import { test } from '../fixtures/baseTest';

test.describe('Planning Module', () => {

  test.beforeEach(async ({ loginPage }) => {

    await loginPage.navigate();

    await loginPage.login();

  });

  test('Automatic Generation', async ({
    planningPage
  }) => {

    await planningPage.openPlanningModule();

    await planningPage.runAutomaticGeneration();

    await planningPage.verifyAutoGenerationSuccess();

  });

});