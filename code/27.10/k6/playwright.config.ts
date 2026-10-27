import { defineConfig, devices } from '@playwright/test';

export default defineConfig({
  testDir: '.',
  outputDir: './test-results',
  timeout: 45_000,
  retries: 1,
  reporter: [['html', { outputFolder: './report', open: 'never' }], ['list']],
  use: {
    baseURL: 'https://dks-st.ru',
    trace: 'on-first-retry',
    screenshot: 'only-on-failure',
    video: 'retain-on-failure',
    locale: 'ru-RU',
  },
  projects: [
    // Chrome: все кейсы
    { name: 'chrome', use: { ...devices['Desktop Chrome'] } },
    // CAT-04: кроссбраузер (Safari и Edge), только тесты с тегом @cross
    { name: 'safari', use: { ...devices['Desktop Safari'] }, grep: /@cross/ },
    { name: 'edge', use: { ...devices['Desktop Edge'], channel: 'msedge' }, grep: /@cross/ },
  ],
});