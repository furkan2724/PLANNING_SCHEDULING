import { test } from '../fixtures/baseTest';

test.describe('Smoke Suite', () => {

  test('Smoke Flow', async ({
    loginPage,
    planningPage
  }) => {

    await loginPage.navigate();

    await loginPage.login();

    await planningPage.openPlanningModule();

  });

});