import fs from 'fs';
import path from 'path';
import { chromium } from '@playwright/test';
import { LoginPage } from './pages/login.page';

async function globalSetup() {

  // ================= CLEAN ALLURE RESULTS =================

  const allureResultsPath = 'allure-results';

  if (fs.existsSync(allureResultsPath)) {

    const preserveItems = [
      'environment.properties',
      'executor.json',
      'history'
    ];

    fs.readdirSync(allureResultsPath).forEach(item => {

      if (!preserveItems.includes(item)) {

        fs.rmSync(
          path.join(allureResultsPath, item),
          { recursive: true, force: true }
        );

      }

    });

  } else {

    fs.mkdirSync(allureResultsPath, { recursive: true });

  }

  // ================= CLEAN OLD REPORT =================

  if (fs.existsSync('allure-report')) {
    fs.rmSync('allure-report', {
      recursive: true,
      force: true
    });
  }

  console.log('✅ Cleaned old Allure reports');

  // ================= LOGIN =================

  const browser = await chromium.launch({
    headless: false,
  });

  const page = await browser.newPage();

  const loginPage = new LoginPage(page);

  await loginPage.navigateToMDM();

  await loginPage.loginToMDM();

  await page.waitForLoadState('networkidle');

  await page.waitForTimeout(5000);

  console.log('Current URL:', await page.url());

  // ================= SAVE SESSION STORAGE =================

  const sessionStorage = await page.evaluate(() => {

    const json: Record<string, string> = {};

    for (let i = 0; i < window.sessionStorage.length; i++) {

      const key = window.sessionStorage.key(i);

      if (key) {
        json[key] = window.sessionStorage.getItem(key) || '';
      }

    }

    return json;

  });

  // ================= CREATE AUTH FOLDER =================

  fs.mkdirSync('playwright/.auth', { recursive: true });

  fs.writeFileSync(
    'playwright/.auth/session.json',
    JSON.stringify(sessionStorage, null, 2)
  );

  console.log('✅ Session storage saved');

  await browser.close();
}

export default globalSetup;