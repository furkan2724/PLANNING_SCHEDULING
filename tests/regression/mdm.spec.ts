import { test } from '@playwright/test';
import allure from 'allure-playwright';
import { CategoryPage } from '../../pages/category.page';
import { ProductPage } from '../../pages/product.page';
import { DataGenerator } from '../../utils/dataGenerator';
import { ResourcePage } from '../../pages/resource.page';
import { WorkstationPage } from '../../pages/workstation.page';
import { BomPage } from '../../pages/bom.page';
import { ProcessRoutingPage } from '../../pages/processRouting.page';
import { LoginPage } from '../../pages/login.page';
import { DemandPage } from '../../pages/demand.page';
import { Logger } from '../../utils/logger';
import { PlanningPage } from '../../pages/planning.page';

test.describe('Full Flow Regression Suite', () => {

  test('End-to-End: Create Category and Product @regression', async ({ page }) => {

    const categoryPage = new CategoryPage(page);
    const productPage = new ProductPage(page);
    const resourcePage = new ResourcePage(page);
    const workstationPage = new WorkstationPage(page);
    const bomPage = new BomPage(page);
    const processRoutingPage = new ProcessRoutingPage(page);
    const loginPage = new LoginPage(page);
    const demandPage = new DemandPage(page);
    const planningPage = new PlanningPage(page);

    const resourceName = DataGenerator.getResourceName();
    const workstationName = DataGenerator.getWorkstationName();

    const categoryName = DataGenerator.getCategoryName();
    const categoryDesc = DataGenerator.getDescription();
    const updatedCategoryDesc = DataGenerator.getDescription();
    const productName = DataGenerator.getProductName();



    await test.step('🚀 Start Test Execution', async () => {
      Logger.step('Start Test Execution');
    });

    // ================= CATEGORY =================
    await test.step('🟢 Navigate to Category Page', async () => {
      Logger.info('Navigating to Category Page');
      await categoryPage.navigate();
    });

    await test.step('➕ Create Category', async () => {
      Logger.info(`Creating Category: ${categoryName}`);
      await categoryPage.clickAddCategory();
      await categoryPage.validateEmptyForm();
      await categoryPage.addCategory(categoryName, categoryDesc, 'test-data/test.png');
      await categoryPage.verifyCategoryCreated(categoryName);
      await categoryPage.verifyImageUploaded(categoryName);
      Logger.success(`Category Created: ${categoryName}`);
    });

    await test.step('✏️ Edit Category', async () => {
      Logger.info(`Editing Category: ${categoryName}`);
      await categoryPage.editCategory(categoryName, updatedCategoryDesc);
      Logger.success(`Category Updated: ${categoryName}`);
    });

    // ================= PRODUCT =================
    await test.step('🔵 Navigate to Product Section', async () => {
      Logger.info('Navigating to Product Section');
      await productPage.goToProductSection();
      await page.waitForLoadState('networkidle');
    });

    await test.step('➕ Create Product', async () => {
      Logger.info(`Creating Product: ${productName}`);
      await productPage.clickAddProduct();
      await productPage.validateEmptyForm();
      await productPage.addProduct(categoryName, productName);
      await productPage.verifyProductCreated(productName);
      Logger.success(`Product Created: ${productName}`);
    });

    await test.step('✏️ Edit Product', async () => {
      Logger.info(`Editing Product: ${productName}`);
      await productPage.editProduct(productName);
      Logger.success(`Product Updated: ${productName}`);
    });

    // ================= RESOURCE =================
    await test.step('🟣 Navigate to Resource Page', async () => {
      Logger.info('Navigating to Resource Page');
      await resourcePage.navigate();
      await page.waitForLoadState('networkidle');
    });

    await test.step('➕ Create Resource', async () => {
      Logger.info(`Creating Resource: ${resourceName}`);
      await resourcePage.clickAddResource();
      await resourcePage.validateEmptyForm();
      await resourcePage.addResource(resourceName);
      await resourcePage.verifyResourceCreated();
      Logger.success(`Resource Created: ${resourceName}`);
    });

    // ================= WORKSTATION =================
    await test.step('🏭 Navigate to Workstation Section', async () => {
      Logger.info('Navigating to Workstation Section');
      await workstationPage.goToWorkstationSection();
      await page.waitForLoadState('networkidle');
    });

    await test.step('➕ Create Workstation', async () => {
      Logger.info(`Creating Workstation: ${workstationName}`);
      await workstationPage.clickAddWorkstation();
      await workstationPage.validateEmptyForm();
      await workstationPage.selectResource(resourceName);
      await workstationPage.selectSubInventory();
      await workstationPage.fillWorkstationName(workstationName);
      await workstationPage.addWorkstation();
      await workstationPage.verifyWorkstationCreated();
      Logger.success(`Workstation Created: ${workstationName}`);
    });

    // ================= BOM =================
    await test.step('🧾 Navigate to BOM Section', async () => {
      Logger.info('Navigating to BOM Section');
      await bomPage.navigateToBOM();
      await page.waitForLoadState('networkidle');
    });

    await test.step('➕ Create BOM (Validation)', async () => {
      Logger.info(`Creating BOM for Product: ${productName}`);
      await bomPage.clickCreateBOM();
      await bomPage.validateEmptyForm();
      await bomPage.selectCategory(categoryName);
      await bomPage.selectProduct(productName);
      await bomPage.createBOM();
      await bomPage.verifyBOMCreated(categoryName, productName);
      Logger.success(`BOM Created for: ${productName}`);
    });

    await test.step('🧩 Add Component to BOM', async () => {
      Logger.info('Adding Component to BOM');
      await bomPage.openVersion();
      await bomPage.clickAddComponent();

      const componentCategory = 'COPPER RING';
      const componentProduct = 'Copper Ring V3 Wfn 37.5x1.5 Th';

      await bomPage.selectComponentCategory(componentCategory);
      await bomPage.selectComponentProduct(componentProduct);
      await bomPage.addComponent();
      await bomPage.verifyComponentAdded(componentProduct);
      Logger.success(`Component Added: ${componentProduct}`);
    });

    // ================= PROCESS ROUTING =================
    await test.step('🧭 Navigate to Process Routing Page', async () => {
      Logger.info('Navigating to Process Routing Page');
      await processRoutingPage.navigate();
    });

    await test.step('➕ Create Process Routing (Validation)', async () => {
      Logger.info('Validating Process Routing Form');
      await processRoutingPage.clickAddRouting();
      await processRoutingPage.validateEmptyForm();
    });

    await test.step('🧩 Fill Process Routing Form', async () => {
      Logger.info(`Creating Process Routing for Product: ${productName}`);
      await processRoutingPage.selectProduct(productName);
      await processRoutingPage.selectResource(resourceName);

      const timeValue = DataGenerator.getRandomNumber?.(1, 10) || 5;
      Logger.info(`Filling Workstation Time: ${timeValue}`);

      await processRoutingPage.fillWorkstationTimes(timeValue);
      await processRoutingPage.submitRouting();
      await processRoutingPage.verifyRoutingCreated(productName);

      Logger.success(`Process Routing Created for: ${productName}`);
    });

    await test.step('✏️ Edit Process Routing', async () => {
      Logger.info(`Editing Process Routing for: ${productName}`);
      await processRoutingPage.editRouting(productName);
      await processRoutingPage.verifyRoutingUpdated();
      Logger.success(`Process Routing Updated: ${productName}`);
    });


    // ================= LOGIN =================


    await test.step('🔐 Login to Planning Application', async () => {
      Logger.info('Logging into application');

      await loginPage.navigate();
      //   await page.waitForLoadState('networkidle');
      await loginPage.login();

      Logger.success('Login successful');
    });

    // ================= DEMAND =================

    await test.step('📦 Open Demand Module', async () => {
      Logger.info('Opening Demand Module');

      await demandPage.openDemandModule();
      await page.waitForLoadState('networkidle');
    });

    await test.step('➕ Create Demand', async () => {
      Logger.info(`Creating Demand for Product: ${productName}`);

      await demandPage.clickAddDemand();

      await demandPage.validateEmptyForm();

      await demandPage.selectProduct(productName);

      await demandPage.selectCustomer('Furkan');

      await demandPage.fillDemandQuantity(50);

      //  await demandPage.selectDueDate('2026-05-08');
      await demandPage.selectDueDate();
      
      await demandPage.selectDemandType();

      await demandPage.submitDemand();

      await demandPage.verifyDemandCreated();

      Logger.success(`Demand Created for Product: ${productName}`);

      await demandPage.openDemandOrders();

      await demandPage.editDemand(30);

      await demandPage.verifyDemandUpdated();

      Logger.success(`Demand updated for Product: ${productName}`);


    });

    // ================= PLANNING =================

    await test.step('📅 Open Planning Module', async () => {
      Logger.info('Opening Planning Module');

      await planningPage.openPlanningModule();
      await page.waitForLoadState('networkidle');

      Logger.success('Planning Module Opened');
    });

    await test.step('✅ Verify Product in Planning', async () => {
      Logger.info(`Verifying Product in Planning: ${productName}`);

      await planningPage.verifyProductInPlanning(productName);

      Logger.success(`Product Verified in Planning: ${productName}`);
    });

    await test.step('📊 Open Gantt Chart', async () => {
      Logger.info('Opening Gantt Chart');

      await planningPage.openGanttChart();

      await planningPage.verifyGanttLoaded();

      Logger.success('Gantt Chart Loaded Successfully');
    });

    await test.step('⚙️ Run Automatic Generation', async () => {
      Logger.info('Running Automatic Generation');

      await planningPage.runAutomaticGeneration();

      await planningPage.verifyAutoGenerationSuccess();

      Logger.success('Automatic Generation Completed');
    });

    await test.step('✅ Test Completed Successfully', async () => {
      Logger.success('All steps completed successfully');
    });

  });

});