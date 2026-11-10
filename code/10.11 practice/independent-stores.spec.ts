// independent-stores.spec.ts
import { test, expect, chromium } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test('Раздел «Магазины»: заголовок и элементы выбора города', async () => {
  // 1. Запускаем "чистый" Chromium (не через Playwright), с портом отладки
  // Примечание: путь к chromium нужно заменить на реальный путь на вашей машине
  const chromiumPath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe'; 
  const userDataDir = 'C:\\temp\\playwright-profile';
  
  // Запускаем Chrome в видимом режиме (headed), без флагов автоматизации
  const chromeProcess = exec(
    `"${chromiumPath}" --remote-debugging-port=9222 --user-data-dir="${userDataDir}" --no-first-run --no-default-browser-check about:blank`
  );

  // Ждём запуска Chrome
  await new Promise(resolve => setTimeout(resolve, 2000));

  let browser;
  try {
    // 2. Playwright подключается к уже запущенному Chrome через CDP
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.newPage();

    // 3. Переходим на страницу
    await page.goto('https://www.dns-shop.ru/shops/', { waitUntil: 'domcontentloaded' });

    // Ждём, пока Qrator выполнит JS-проверку и установит cookie
    await page.waitForTimeout(5000);

    // Проверяем, что не попали на страницу блокировки
    const bodyText = await page.locator('body').innerText();
    if (bodyText.includes('Доступ ограничен') || bodyText.includes('qrator')) {
      throw new Error('Qrator всё ещё блокирует. Возможно, проблема в IP-адресе.');
    }

    // 4. Ваши оригинальные проверки
    await expect(page).toHaveURL(/shops|magazin/i, { timeout: 15000 });

    const heading = page.getByRole('heading', { level: 1 }).first();
    await expect(heading).toBeVisible({ timeout: 15000 });

    const citySelector = page
      .getByRole('button', { name: /город|москва|санкт/i })
      .or(page.getByText(/выбрать город/i))
      .first();
    await expect(citySelector).toBeVisible({ timeout: 15000 });

  } finally {
    // Закрываем подключение и процесс Chrome
    if (browser) await browser.close();
    chromeProcess.kill();
  }
});
