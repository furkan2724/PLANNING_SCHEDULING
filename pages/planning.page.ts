import { expect, Page } from '@playwright/test';

export class PlanningPage {
  constructor(private page: Page) {}

  async openPlanningModule() {
    await this.page.getByRole('button', { name: 'Go to dashboard' }).click();
    await this.page.getByRole('button', {
      name: /Module 3 Planning/,
    }).click();

    await expect(
      this.page.getByRole('heading', {
        name: 'Production Plan',
      })
    ).toBeVisible();
  }

  async verifyProductInPlanning(productName: string) {
    await expect(
      this.page.getByRole('cell', {
        name: new RegExp(productName),
      })
    ).toBeVisible();
  }

  async openGanttChart() {
    await this.page.getByRole('button', {
      name: 'Gantt Chart',
    }).click();
  }

  async verifyGanttLoaded() {
    await expect(
      this.page.getByRole('heading', {
        name: 'Production Schedule - Gantt',
      })
    ).toBeVisible();
  }

  async runAutomaticGeneration() {
    await this.page.getByRole('button', {
      name: 'Automatic generation',
    }).click();

    await this.page
      .getByLabel('Confirm automatic generation')
      .getByRole('button', {
        name: 'Automatic generation',
      })
      .click();
  }

  async verifyAutoGenerationSuccess() {
    await expect(
      this.page.getByText('Shop Floor Plan seeding')
    ).toBeVisible();
  }
}