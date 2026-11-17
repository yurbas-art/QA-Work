// independent-footer.spec.ts
import { test, expect, chromium } from '@playwright/test';
import { exec } from 'child_process';
import { promisify } from 'util';

const execAsync = promisify(exec);

test('Футер главной страницы: контакты и правовые ссылки', async () => {
  // 1. Запускаем "чистый" Chrome (не через Playwright) с портом отладки
  // Замените путь на реальный путь к Chrome на вашей машине
  const chromePath = 'C:\\Program Files\\Google\\Chrome\\Application\\chrome.exe';
  const userDataDir = 'C:\\temp\\playwright-dns-profile';

  const chromeProcess = exec(
    `"${chromePath}" --remote-debugging-port=9222 --user-data-dir="${userDataDir}" --no-first-run --no-default-browser-check about:blank`
  );

  // Ждём запуска Chrome
  await new Promise(resolve => setTimeout(resolve, 2000));

  let browser;
  try {
    // 2. Подключаемся к уже запущенному Chrome через CDP
    // Это ключевой момент: браузер запущен БЕЗ chromedriver, поэтому нет флагов автоматизации
    browser = await chromium.connectOverCDP('http://127.0.0.1:9222');
    const context = browser.contexts()[0];
    const page = context.pages()[0] || await context.newPage();

    // 3. Переходим на страницу
    await page.goto('https://www.dns-shop.ru', { waitUntil: 'domcontentloaded' });

    // Даём Qrator выполнить JS-челлендж
    await page.waitForTimeout(5000);

    // Проверяем, не попали ли на страницу блокировки
    const bodyText = await page.locator('body').innerText();
    if (bodyText.includes('Доступ ограничен') || bodyText.includes('qrator')) {
      throw new Error('Qrator всё ещё блокирует. Скорее всего, проблема в IP-адресе (нужен российский IP без VPN).');
    }

    // 4. Ваши оригинальные проверки
    const footer = page.locator('footer').first();
    await footer.scrollIntoViewIfNeeded({ timeout: 15000 });
    await expect(footer).toBeVisible({ timeout: 15000 });

    const phoneLink = footer.getByText(/8[-\s]?800/).first();
    await expect(phoneLink).toBeVisible({ timeout: 10000 });

    const legalLink = footer
      .getByRole('link', { name: /политик|оферт|услови|конфиденц/i })
      .first();
    await expect(legalLink).toBeVisible({ timeout: 10000 });

  } finally {
    if (browser) await browser.close();
    chromeProcess.kill();
  }
});
