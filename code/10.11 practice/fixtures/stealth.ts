// fixtures/stealth.ts
import { chromium } from 'playwright-extra';
import StealthPlugin from 'puppeteer-extra-plugin-stealth';

// Подключаем плагин
chromium.use(StealthPlugin());

export async function launchStealthBrowser() {
  const browser = await chromium.launch({
    headless: false, // Для DNS лучше видимый режим
    args: [
      '--disable-blink-features=AutomationControlled',
    ],
  });

  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
    viewport: { width: 1920, height: 1080 },
  });

  const page = await context.newPage();
  return { browser, page };
}
