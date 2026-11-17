import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://vl.ru';

// Для этих тестов используем Firefox, как указано в TC-12 и примере
test.use({
  browserName: 'firefox',
  locale: 'ru-RU',
  viewport: { width: 1920, height: 1080 },
});

// TC-11. Работа ссылок в подвале сайта
test('TC-11: работа ссылок в подвале сайта', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  // 1. Пролистать страницу вниз до футера
  const footer = page.locator('footer').first();
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();

  // Собираем все ссылки в футере
  const links = footer.locator('a');
  const count = await links.count();
  expect(count, 'В футере не найдены ссылки').toBeGreaterThan(0);

  // 2. Кликнуть по каждой ссылке (О проекте, Реклама, Контакты и т.п.)
  // Проверяем первые 5 ссылок (чтобы не делать 100 запросов за один тест)
  const linksToTest = Math.min(count, 5);
  
  for (let i = 0; i < linksToTest; i++) {
    const link = links.nth(i);
    const href = await link.getAttribute('href');
    
    // Пропускаем пустые ссылки, якоря и javascript
    if (!href || href.startsWith('#') || href.startsWith('javascript')) continue;

    const url = new URL(href, BASE_URL).href;

    // 3. Проверить открывшуюся страницу
    // Ожидаемый результат: Каждая ссылка ведёт на существующую страницу, нет 404 и ошибок
    const response = await page.request.get(url, {
      maxRedirects: 5,
      failOnStatusCode: false,
    });

    expect(
      response.status(),
      `Ссылка "${await link.innerText()}" (${url}) вернула статус ${response.status()}`
    ).toBeLessThan(400);
  }
});

// TC-11 (Дополнительно). Сохранение города ВДК при редиректе на Дром/Фарпост
test('TC-11: редирект на Дром/Фарпост с сохранением города ВДК', async ({ page }) => {
  await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });

  const footer = page.locator('footer').first();
  await footer.scrollIntoViewIfNeeded();

  // Ищем партнерские ссылки
  const externalLinks = footer.locator('a[href*="drom.ru"], a[href*="farpost.ru"]');
  const extCount = await externalLinks.count();
  
  if (extCount === 0) {
    test.skip(true, 'На странице нет ссылок на Дром или Фарпост');
  }

  // Проверяем первую найденную партнерскую ссылку
  const href = await externalLinks.first().getAttribute('href');
  if (href) {
    const response = await page.request.get(href, {
      maxRedirects: 5,
      failOnStatusCode: false,
    });
    
    expect(response.status(), `Внешняя ссылка ${href} недоступна`).toBeLessThan(400);
    
    // Проверка сохранения города ВДК (эвристика по вхождению в URL)
    const finalUrl = response.url();
    expect(
      /vladivostok|vdk|vl\.ru/i.test(finalUrl),
      `В URL ${finalUrl} не сохранился город ВДК`
    ).toBeTruthy();
  }
});

// TC-12. Кросс-браузерность: отображение главной в другом браузере
test('TC-12: отображение главной в другом браузере', async ({ page, browserName }) => {
  // 1. Открыть Firefox (или Edge)
  // (Браузер уже открыт благодаря test.use в начале файла)

  // 2. Перейти на https://vl.ru
  const response = await page.goto(BASE_URL, { waitUntil: 'domcontentloaded' });
  expect(response?.status(), 'Главная страница недоступна').toBeLessThan(400);

  // 3. Сравнить отображение с Chrome
  // Ожидаемый результат: Страница отображается так же, как в Chrome, весь функционал доступен
  
  // Проверяем, что заголовок страницы не пустой
  await expect(page).toHaveTitle(/.+/);

  // Проверяем, что шапка сайта отображается
  const header = page.locator('header').first();
  await expect(header).toBeVisible();

  // Проверяем, что футер отображается
  const footer = page.locator('footer').first();
  await footer.scrollIntoViewIfNeeded();
  await expect(footer).toBeVisible();

  // Проверяем, что навигация функциональна (есть кликабельные ссылки)
  const navLinks = header.locator('a');
  expect(await navLinks.count(), 'В навигации отсутствуют ссылки').toBeGreaterThan(0);

  // Визуальная проверка (опционально): делаем скриншот, чтобы можно было глазами сравнить с Chrome
  // await page.screenshot({ path: `homepage-${browserName}.png`, fullPage: false });
});
