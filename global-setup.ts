import fs from 'fs';

async function globalSetup() {
  if (fs.existsSync('allure-results')) {
    fs.rmSync('allure-results', { recursive: true, force: true });
  }

  if (fs.existsSync('allure-report')) {
    fs.rmSync('allure-report', { recursive: true, force: true });
  }

  console.log('✅ Cleaned old Allure reports');
}

export default globalSetup;