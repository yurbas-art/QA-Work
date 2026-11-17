import { test, expect } from '@playwright/test';

test.describe('Простые E2E тесты для VL.ru', () => {

  // ТЕСТ 1: Футер (TC-08)
  test('Переход на страницу «Контакты»', async ({ page }) => {
    // 1. Открываем сайт (используем относительный путь, если baseURL задан в конфиге, или полный)
    await page.goto('https://vl.ru');

    // 2. Ищем ссылку "Контакты". 
    // .last() берет самую нижнюю на странице (в футере), так как в шапке её может не быть или она другая.
    const contactsLink = page.getByRole('link', { name: 'Контакты', exact: true }).last();
    
    // Прокручиваем к ней, чтобы Playwright мог по ней кликнуть
    await contactsLink.scrollIntoViewIfNeeded();
    await contactsLink.click();

    // 3. Проверяем, что URL изменился
    await expect(page).toHaveURL(/.*(contacts|kontakty).*/i);
    
    // 4. Проверяем, что нет ошибки 404
    await expect(page.locator('body')).not.toContainText('404');
  });

  // ТЕСТ 2: Адаптивность (TC-09)
  test('Нет горизонтальной прокрутки на iPhone 12', async ({ page }) => {
    // 1. Включаем мобильный экран (390x844)
    await page.setViewportSize({ width: 390, height: 844 });
    await page.goto('https://vl.ru');

    // 2. Проверяем ширину страницы через JavaScript
    const hasHorizontalScroll = await page.evaluate(() => {
      return document.documentElement.scrollWidth > document.documentElement.clientWidth;
    });
    
    // Если true — тест упадет (значит, есть прокрутка)
    expect(hasHorizontalScroll, 'Появилась горизонтальная прокрутка').toBeFalsy();

    // 3. Проверяем, что кнопка "бургер" (мобильное меню) видна
    // Ищем кнопку в хедере (шапке)
    const burgerBtn = page.locator('header button, header .burger, header .menu-toggle').first();
    await expect(burgerBtn).toBeVisible();
  });

  // ТЕСТ 3: Страница 404 (TC-10)
  test('Отображение страницы 404', async ({ page }) => {
    // 1. Переходим по несуществующему адресу и сохраняем ответ сервера
    const response = await page.goto('https://vl.ru/nonexistent-page-12345');
    
    // 2. Проверяем код ответа (должен быть 404)
    expect(response?.status()).toBe(404);

    // 3. Проверяем, что текст ошибки виден
    await expect(page.locator('body')).toContainText(/404|Страница не найдена/i);

    // 4. Проверяем, что шапка (логотип) осталась на месте
    const logo = page.locator('header img, header svg').first();
    await expect(logo).toBeVisible();
  });
});
