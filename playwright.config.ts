import { defineConfig, devices } from '@playwright/test'

const port = Number(process.env.PLAYWRIGHT_PORT ?? 5177)
const host = '127.0.0.1'
const baseURL = `http://${host}:${port}`

export default defineConfig({
  testDir: './tests/e2e',
  outputDir: '/tmp/inventorie-playwright-results',
  timeout: 60_000,
  expect: {
    timeout: 8_000,
  },
  fullyParallel: false,
  reporter: [['list'], ['html', { open: 'never', outputFolder: '/tmp/inventorie-playwright-report' }]],
  use: {
    baseURL,
    trace: 'retain-on-failure',
  },
  webServer: {
    command: `npm run dev -- --host ${host} --port ${port}`,
    url: baseURL,
    reuseExistingServer: !process.env.CI,
    timeout: 120_000,
  },
  projects: [
    {
      name: 'chromium',
      use: {
        ...devices['Desktop Chrome'],
        viewport: {
          width: 1280,
          height: 900,
        },
      },
    },
  ],
})
