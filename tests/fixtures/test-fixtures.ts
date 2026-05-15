import { test as base, expect } from '@playwright/test';
import { CategoryPage } from '../../pages/category.page';
import { ProductPage } from '../../pages/product.page';
import { ResourcePage } from '../../pages/resource.page';
import { WorkstationPage } from '../../pages/workstation.page';
import { BomPage } from '../../pages/bom.page';

// ✅ Define fixture types
type MyFixtures = {
    categoryPage: CategoryPage;
    productPage: ProductPage;
    resourcePage: ResourcePage;
    workstationPage: WorkstationPage;
    bomPage: BomPage;
};

// ✅ Extend with types
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
});

export { expect };