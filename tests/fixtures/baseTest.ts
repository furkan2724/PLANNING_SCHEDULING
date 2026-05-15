import { test as base } from '@playwright/test';

import { CategoryPage } from '../../pages/category.page';
import { ProductPage } from '../../pages/product.page';
import { ResourcePage } from '../../pages/resource.page';
import { WorkstationPage } from '../../pages/workstation.page';
import { BomPage } from '../../pages/bom.page';
import { ProcessRoutingPage } from '../../pages/processRouting.page';
import { LoginPage } from '../../pages/login.page';
import { DemandPage } from '../../pages/demand.page';
import { PlanningPage } from '../../pages/planning.page';

type MyFixtures = {
  categoryPage: CategoryPage;
  productPage: ProductPage;
  resourcePage: ResourcePage;
  workstationPage: WorkstationPage;
  bomPage: BomPage;
  processRoutingPage: ProcessRoutingPage;
  loginPage: LoginPage;
  demandPage: DemandPage;
  planningPage: PlanningPage;
};

export const test = base.extend<MyFixtures>({
  categoryPage: async ({ page }, use) => {
    await use(new CategoryPage(page));
  },

  productPage: async ({ page }, use) => {
    await use(new ProductPage(page));
  },

  resourcePage: async ({ page }, use) => {
    await use(new ResourcePage(page));
  },

  workstationPage: async ({ page }, use) => {
    await use(new WorkstationPage(page));
  },

  bomPage: async ({ page }, use) => {
    await use(new BomPage(page));
  },

  processRoutingPage: async ({ page }, use) => {
    await use(new ProcessRoutingPage(page));
  },

  loginPage: async ({ page }, use) => {
    await use(new LoginPage(page));
  },

  demandPage: async ({ page }, use) => {
    await use(new DemandPage(page));
  },

  planningPage: async ({ page }, use) => {
    await use(new PlanningPage(page));
  },
});

export { expect } from '@playwright/test';