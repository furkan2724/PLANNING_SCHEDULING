import { test } from '../fixtures/baseTest';
import { Logger } from '../../utils/logger';
import { DataGenerator } from '../../utils/dataGenerator';
import { TestDataProvider } from '../../utils/testDataProvider';

test.describe('Full Flow Regression Suite', () => {

  test('End-to-End Full Regression Flow @regression', async ({
    page, categoryPage, productPage, resourcePage, workstationPage, bomPage, processRoutingPage, loginPage, demandPage, planningPage
  }) => {

    // ================= TEST DATA =================

    // const resourceName = DataGenerator.getResourceName();

    // const workstationName = DataGenerator.getWorkstationName();

    // const categoryName = DataGenerator.getCategoryName();

    // const categoryDesc = DataGenerator.getDescription();

    // const updatedCategoryDesc = DataGenerator.getDescription();

    // const productName = DataGenerator.getProductName();

    const DATA_SOURCE =
      (process.env.DATA_SOURCE as 'faker' | 'excel') || 'faker';

    const ROW_INDEX = Number(process.env.ROW_INDEX || 0);

    const testData = TestDataProvider.getData(
      DATA_SOURCE,
      ROW_INDEX
    );

    const resourceName = testData.resourceName;
    const workstationName = testData.workstationName;

    const categoryName = testData.categoryName;
    const categoryDesc = testData.categoryDesc;
    const updatedCategoryDesc = testData.updatedCategoryDesc;
    const productName = testData.productName;

    // ================= START =================

    await test.step('🚀 Start Test Execution', async () => {
      Logger.step('Start Test Execution');
    });

    // ================= MDM LOGIN =================

    // await test.step('🔐 Login to MDM Application', async () => {

    //   Logger.info('Logging into MDM application');

    //   await loginPage.navigateToMDM();

    //   await loginPage.loginToMDM();

    //   Logger.success('MDM Login successful');

    // });

    // ================= CATEGORY =================

    await test.step('🟢 Navigate to Category Page', async () => {

      Logger.info('Navigating to Category Page');

      await categoryPage.navigate();

      // await page.waitForLoadState('networkidle');

    });

    await test.step('➕ Create Category', async () => {

      Logger.info(`Creating Category: ${categoryName}`);

      await categoryPage.clickAddCategory();

      await categoryPage.validateEmptyForm();

      await categoryPage.addCategory(
        categoryName,
        categoryDesc,
        'test-data/test.png'
      );

      await categoryPage.verifyCategoryCreated(categoryName);

      await categoryPage.verifyImageUploaded(categoryName);

      Logger.success(`Category Created: ${categoryName}`);

    });

    await test.step('✏️ Edit Category', async () => {

      Logger.info(`Editing Category: ${categoryName}`);

      await categoryPage.editCategory(
        categoryName,
        updatedCategoryDesc
      );

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

      await productPage.addProduct(
        categoryName,
        productName
      );

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

      //  await workstationPage.verifyWorkstationCreated();

      Logger.success(`Workstation Created: ${workstationName}`);

    });

    // ================= BOM =================

    await test.step('🧾 Navigate to BOM Section', async () => {

      Logger.info('Navigating to BOM Section');

      await bomPage.navigateToBOM();

      await page.waitForLoadState('networkidle');

    });

    await test.step('➕ Create BOM', async () => {

      Logger.info(`Creating BOM for Product: ${productName}`);

      await bomPage.clickCreateBOM();

      await bomPage.validateEmptyForm();

      await bomPage.selectCategory(categoryName);

      await bomPage.selectProduct(productName);

      await bomPage.createBOM();

      await bomPage.verifyBOMCreated(
        categoryName,
        productName
      );

      Logger.success(`BOM Created for: ${productName}`);

    });

    await test.step('🧩 Add Component to BOM', async () => {

      Logger.info('Adding Component to BOM');

      await bomPage.openVersion();

      await bomPage.clickAddComponent();

      const componentCategory = 'COPPER RING';

      const componentProduct =
        'Copper Ring V3 Wfn 37.5x1.5 Th';

      await bomPage.selectComponentCategory(
        componentCategory
      );

      await bomPage.selectComponentProduct(
        componentProduct
      );

      await bomPage.addComponent();

      //  await bomPage.verifyComponentAdded(
      //    componentProduct
      //  );

      Logger.success(
        `Component Added: ${componentProduct}`
      );

    });

    // ================= PROCESS ROUTING =================

    await test.step('🧭 Navigate to Process Routing Page', async () => {

      Logger.info('Navigating to Process Routing Page');

      await processRoutingPage.navigate();

    });

    await test.step('➕ Create Process Routing', async () => {

      Logger.info(
        `Creating Process Routing for Product: ${productName}`
      );

      await processRoutingPage.clickAddRouting();

      await processRoutingPage.validateEmptyForm();

      await processRoutingPage.selectProduct(
        productName
      );

      await processRoutingPage.selectResource(
        resourceName
      );

      const timeValue =
        DataGenerator.getRandomNumber(1, 10);

      Logger.info(
        `Filling Workstation Time: ${timeValue}`
      );

      await processRoutingPage.fillWorkstationTimes(
        timeValue
      );

      await processRoutingPage.submitRouting();

      await processRoutingPage.verifyRoutingCreated(
        productName
      );

      Logger.success(
        `Process Routing Created for: ${productName}`
      );

    });

    await test.step('✏️ Edit Process Routing', async () => {

      Logger.info(
        `Editing Process Routing for: ${productName}`
      );

      await processRoutingPage.editRouting(
        productName
      );

      await processRoutingPage.verifyRoutingUpdated();

      Logger.success(
        `Process Routing Updated: ${productName}`
      );

    });


    // ================= END =================

    await test.step('✅ Test Completed Successfully', async () => {

      Logger.success(
        'All steps completed successfully'
      );

    });

  });

});