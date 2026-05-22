import { test, expect } from '../fixtures/baseTest';
import { Logger } from '../../utils/logger';
import { DataGenerator } from '../../utils/dataGenerator';

test.describe('Planning Module - Comprehensive Test Suite', () => {

  test('📅 Open Planning Module', async ({ planningPage, page }) => {
    await test.step('Open planning module', async () => {
      await planningPage.openPlanningModule();
      await page.waitForLoadState('networkidle');
      Logger.success('Planning Module Opened');
    });
  });

  test('✅ Verify Product in Planning', async ({ planningPage }) => {
    const productName = DataGenerator.getProductName();

    await test.step('Verify product presence', async () => {
      await planningPage.verifyProductInPlanning(productName);
      Logger.success(`Product Verified in Planning: ${productName}`);
    });
  });

  test('📊 Open Gantt Chart', async ({ planningPage }) => {
    await test.step('Open Gantt', async () => {
      await planningPage.openGanttChart();
      await planningPage.verifyGanttLoaded();
      Logger.success('Gantt Chart Loaded Successfully');
    });
  });

  test('⚙️ Run Automatic Generation', async ({ planningPage }) => {
    await test.step('Run automatic generation', async () => {
      await planningPage.runAutomaticGeneration();
      await planningPage.verifyAutoGenerationSuccess();
      Logger.success('Automatic Generation Completed');
    });
  });

});
