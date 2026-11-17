import { chromium } from 'playwright-extra';
import stealth from 'puppeteer-extra-plugin-stealth';
import { test, expect } from '@playwright/test';

chromium.use(stealth());

test('DNS главная страница с обходом', async () => {
  const browser = await chromium.launch({ headless: false }); // Лучше с видимым окном
  const context = await browser.newContext({
    userAgent: 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/131.0.0.0 Safari/537.36',
  });
  const page = await context.newPage();
  
  await page.goto('https://www.dns-shop.ru/');
  // ... ваши проверки ...
  
  await browser.close();
});
