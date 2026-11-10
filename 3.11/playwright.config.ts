import { defineConfig, devices, Project } from '@playwright/test';
import * as dotenv from 'dotenv';
import * as path from 'node:path';

dotenv.config({ path: path.resolve(__dirname, '.env') });

export default defineConfig({
  testDir: './tests',
  fullyParallel: true,
  forbidOnly: !!process.env.CI,
  retries: 0,
  workers: 1,
  reporter: [['html', { open: 'never' }]],
  use: {
    baseURL: 'https://vl.ru',
    headless: false,
    viewport: { width: 1920, height: 1080 },
    ignoreHTTPSErrors: true,
    screenshot: 'on',
    trace: 'on-first-retry',
  },
  projects: [
    {
      name: 'Custom-Browser',
      use: {
        ...devices['Desktop Chrome'],
        // Явное приведение к типу строки или undefined решает конфликт перегрузки функций
        executablePath: (process.env.BROWSER_EXECUTABLE_PATH as string) || undefined,
      },
    } as Project, // Принудительно типизируем объект как валидный Project Playwright
  ],
});
