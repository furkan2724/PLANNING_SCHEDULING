import { expect, Page } from '@playwright/test';

export class DemandPage {
  constructor(private page: Page) { }

  async openDemandModule() {
    await this.page.getByRole('button', {
      name: 'Module 1 Demand Management',
    }).click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Demand Booking',
        exact: true,
      })
    ).toBeVisible();
  }

  async clickAddDemand() {
    await this.page.getByRole('button', {
      name: 'Add Demand',
    }).click();
  }

  async validateEmptyForm() {
    await this.page
      .getByLabel('Add New Demand')
      .getByRole('button', { name: 'Add Demand' })
      .click();

    await expect(
      this.page.getByText('Please select a product.')
    ).toBeVisible();
  }

  async selectProduct(productName: string) {
    await this.page
      .getByRole('button', {
        name: 'Search or select product',
      })
      .click();

    await this.page
      .getByRole('textbox', {
        name: 'Search products...',
      })
      .fill(productName);

    await this.page
      .locator('div[role="listbox"] button')
      .filter({ hasText: productName })
      .click();
  }

  async selectCustomer(customerName: string) {
    await this.page
      .getByRole('button', {
        name: 'Search or select customer',
      })
      .click();

    await this.page
      .getByRole('textbox', {
        name: 'Search customers...',
      })
      .fill(customerName);

    await this.page
      .getByRole('button', {
        name: customerName,
      })
      .click();
  }

  async fillDemandQuantity(quantity: number) {
    await this.page
      .getByRole('spinbutton', {
        name: 'Demand Quantity *',
      })
      .fill(quantity.toString());
  }

  // async selectDueDate(date: string) {
  // await this.page
  //   .getByRole('textbox', {
  //     name: 'Due Date *',
  //   })
  //   .fill(date);
  async selectDueDate() {
    const today = new Date().toISOString().split('T')[0];

    await this.page.locator('input[type="date"]').fill(today);
  }

  async selectDemandType() {
    await this.page.getByRole('button', { name: 'Select demand type' }).click();
    await this.page.getByRole('button', { name: 'Confirm' }).click();
  }


  async submitDemand() {
    await this.page
      .getByLabel('Add New Demand')
      .getByRole('button', {
        name: 'Add Demand',
      })
      .click();
  }

  async verifyDemandCreated() {
    await expect(
      this.page.getByText('Demand created successfully!')
    ).toBeVisible();
  }

  async openDemandOrders() {
    await this.page.getByRole('button', {
      name: 'Demand Orders',
    }).click();
  }

  async openDemandOrder(productName: string) {
    await this.page.getByRole('cell', {
      name: new RegExp(productName),
    }).click();
  }

  async verifyDemandStatus(status: string) {
    await expect(this.page.locator('tbody')).toContainText(status);
  }

  async editDemand(quantity: number) {
    await this.page
      .getByLabel('Edit this demand')
      .first()
      .click();

    await this.page
      .getByRole('spinbutton', {
        name: 'Demand Quantity *',
      })
      .fill(quantity.toString());

    await this.page.getByRole('button', {
      name: 'Update Demand',
    }).click();

    await this.page.getByRole('button', {
      name: 'Update',
      exact: true,
    }).click();
  }

  async verifyDemandUpdated() {
    await expect(
      this.page.getByText('Demand updated successfully!')
    ).toBeVisible();
  }
}