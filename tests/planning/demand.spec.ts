import { test } from '../fixtures/baseTest';

test.describe('Demand Module', () => {

  test.beforeEach(async ({ loginPage }) => {

    await loginPage.navigate();

    await loginPage.login();

  });

  test('Create Demand', async ({
    demandPage
  }) => {

    await demandPage.openDemandModule();

    await demandPage.clickAddDemand();

    await demandPage.validateEmptyForm();

    // continue flow

  });

});