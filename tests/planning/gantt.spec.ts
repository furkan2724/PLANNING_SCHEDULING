import { test } from '../fixtures/baseTest';

test.describe('Gantt Module', () => {

  test.beforeEach(async ({ loginPage }) => {

    await loginPage.navigate();

    await loginPage.login();

  });

  test('Open Gantt Chart', async ({
    planningPage
  }) => {

    await planningPage.openPlanningModule();

    await planningPage.openGanttChart();

    await planningPage.verifyGanttLoaded();

  });

});