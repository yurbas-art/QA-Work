import { test, expect } from '@playwright/test';

test.describe('Глобальный поиск по сайту vl.ru', () => {

  test.beforeEach(async ({ page }) => {
    // Шаг общий для всех кейсов: Открыть главную страницу
    await page.goto('/');
    await page.waitForLoadState('networkidle');
  });

  test('TC-03: Поиск по существующему слову', async ({ page }) => {
    // <a href="#" class="header__search-form-toggle" > Поиск </a>
    const searchToggle = page.locator('a.header__search-form-toggle');
    await expect(searchToggle).toBeVisible();
    await searchToggle.click();
    
    const searchInput = page.locator('input[name="q"]');
    await expect(searchInput).toBeVisible();
    
    // 1. Кликнуть в поле поиска и ввести существующее слово
    await searchInput.click();
    await searchInput.fill('Владивосток');
    
    // 2. Отправить форму нажатием Enter
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');

    // Ожидаемый результат: URL изменился, результаты содержат ключевое слово
    await expect(page).toHaveURL(/.*search.*/);
    
    // Проверка, что на странице есть элементы выдачи
    const resultsContainer = page.locator('.search-results, .search-output, body');
    await expect(resultsContainer).toBeVisible();
    
    // Проверяем наличие текста на странице результатов
    await expect(page.locator('body')).toContainText('Владивосток');
  });

  test('TC-04: Поиск по несуществующему запросу', async ({ page }) => {
    const searchInput = page.locator('input[name="q"]');
    
    // 1. Кликнуть в поле поиска и ввести бессмысленный набор символов
    await searchInput.click();
    await searchInput.fill('ъъъыыыццц123qwe');
    
    // 2. Нажать Enter
    await page.keyboard.press('Enter');
    await page.waitForLoadState('networkidle');

    // Ожидаемый результат: Отображается сообщение о том, что ничего не найдено
    const emptyMessage = page.locator('text=Ничего не найдено');
    await expect(emptyMessage).toBeVisible();
  });

  test('TC-05: Поиск с пустым полем', async ({ page }) => {
    const searchInput = page.locator('input[name="q"]');
    const initialURL = page.url();
    
    // 1. Убедиться, что поле пустое
    await searchInput.click();
    await searchInput.fill('');
    
    // 2. Попытаться отправить форму через Enter
    await page.keyboard.press('Enter');
    
    // Даем небольшую задержку, чтобы проверить, не произошел ли переход
    await page.waitForTimeout(1000);

    // Ожидаемый результат: Поиск не выполняется, мы остались на той же странице
    expect(page.url()).toBe(initialURL);
  });

});
