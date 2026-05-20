import { defineConfig, devices } from '@playwright/test';


export default defineConfig({
  testDir: './tests',
  /* Run tests in files in parallel */
  fullyParallel: true,
  /* Fail the build on CI if you accidentally left test.only in the source code. */
  forbidOnly: !!process.env.CI,
  /* Retry on CI only */
  retries: process.env.CI ? 2 : 0,
  /* Opt out of parallel tests on CI. */
 // workers: process.env.CI ? 1 : undefined,
 workers: 1,
 maxFailures: 0,
  reporter: [
    ['list'],
    ['allure-playwright']
  ],

  globalSetup: require.resolve('./global-setup'),
  use: {
    
    actionTimeout: 15000,
    navigationTimeout: 30000,

    launchOptions: {
      slowMo: 300,
    },
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    ignoreHTTPSErrors: true,
  },

  projects: [
    {
      name: 'chromium',
      use: { ...devices['Desktop Chrome'] },
    },


  ],


});
