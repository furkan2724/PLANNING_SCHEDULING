import { test, expect } from '../fixtures/baseTest';
import { Logger } from '../../utils/logger';
import { DataGenerator } from '../../utils/dataGenerator';

test.describe('Demand Management - Comprehensive Test Suite', () => {

  test('✅ Happy Path: Create Demand', async ({ demandPage, page }) => {
    const productName = DataGenerator.getProductName();

    await test.step('Open Demand Module', async () => {
      await demandPage.openDemandModule();
      await page.waitForLoadState('networkidle');
      Logger.info('Demand module opened');
    });

    await test.step('Create Demand', async () => {
      await demandPage.clickAddDemand();
      await demandPage.validateEmptyForm();
      await demandPage.selectProduct(productName);
      await demandPage.selectCustomer('Furkan');
      await demandPage.fillDemandQuantity(50);
      await demandPage.selectDueDate();
      await demandPage.selectDemandType();
      await demandPage.submitDemand();
      await demandPage.verifyDemandCreated();
      Logger.success(`Demand Created for Product: ${productName}`);
    });
  });

  test('✅ Happy Path: Update Demand', async ({ demandPage, page }) => {
    const productName = DataGenerator.getProductName();

    await test.step('Create demand to update', async () => {
      await demandPage.openDemandModule();
      await page.waitForLoadState('networkidle');
      await demandPage.clickAddDemand();
      await demandPage.selectProduct(productName);
      await demandPage.selectCustomer('Furkan');
      await demandPage.fillDemandQuantity(20);
      await demandPage.selectDueDate();
      await demandPage.selectDemandType();
      await demandPage.submitDemand();
      await demandPage.verifyDemandCreated();
      Logger.success(`Demand created for update: ${productName}`);
    });

    await test.step('Edit Demand', async () => {
      await demandPage.openDemandOrders();
      await demandPage.editDemand(30);
      await demandPage.verifyDemandUpdated();
      Logger.success('Demand update verified');
    });
  });

  test('❌ Negative: Cannot create demand without product', async ({ demandPage, page }) => {
    await test.step('Open Demand Module', async () => {
      await demandPage.openDemandModule();
      await page.waitForLoadState('networkidle');
    });

    await test.step('Attempt create without product', async () => {
      await demandPage.clickAddDemand();
      await demandPage.fillDemandQuantity(10);
      await demandPage.selectDueDate();
      await demandPage.selectDemandType();
      await demandPage.submitDemand();
      // Expect validation message or failure
      await expect(page.getByText('Product is required')).toBeVisible();
      Logger.success('Validation for missing product verified');
    });
  });

});
