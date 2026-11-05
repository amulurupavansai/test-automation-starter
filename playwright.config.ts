import { defineConfig, devices } from '@playwright/test';
import { baseURL, envName, useDemoApp } from './config/environments';

const isCI = !!process.env.CI;

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: isCI,
  retries: isCI ? 2 : 1,
  workers: isCI ? 2 : undefined,
  timeout: 30_000,
  expect: {
    timeout: 5_000,
    // Visual snapshots. The committed baseline was rendered on the CI runner, so CI is strict.
    // Developer machines anti-alias text slightly differently (~1%), so locally we allow 2%.
    // A looser local check can miss tiny text edits - treat CI as the source of truth.
    toHaveScreenshot: { maxDiffPixelRatio: isCI ? 0.002 : 0.02 },
  },

  reporter: [
    ['list'],
    ['html', { outputFolder: 'playwright-report', open: 'never' }],
    ['junit', { outputFile: 'reports/junit.xml' }],
  ],

  use: {
    baseURL,
    trace: 'retain-on-failure',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    actionTimeout: 10_000,
  },

  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        // Optional: use an already-installed Chrome/Chromium instead of Playwright's download.
        launchOptions: process.env.CHROMIUM_EXECUTABLE_PATH
          ? { executablePath: process.env.CHROMIUM_EXECUTABLE_PATH }
          : {},
      },
    },
    // Uncomment to add more browsers (then run `npx playwright install firefox webkit`):
    // { name: 'firefox', use: { ...devices['Desktop Firefox'] } },
    // { name: 'webkit', use: { ...devices['Desktop Safari'] } },
  ],

  // Start the bundled demo app only for the "local" environment.
  webServer: useDemoApp
    ? {
        command: 'node demo-app/server.js',
        url: `${baseURL}/api/health`,
        reuseExistingServer: !isCI,
        timeout: 15_000,
      }
    : undefined,

  metadata: { environment: envName },
});
