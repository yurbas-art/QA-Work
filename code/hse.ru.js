import { test, expect } from '@playwright/test';
import { HsePage } from './hse.page';

test.describe('Функциональные и структурные тесты главной страницы НИУ ВШЭ', () => {
  let hsePage: HsePage;

  test.beforeEach(async ({ page }) => {
    hsePage = new HsePage(page);
    await hsePage.goto();
  });

  // 1. Проверка интерактивности поиска (ввод текста и появление кнопки/подсказок)
  test('Тест 1: Интерактивность поля поиска', async () => {
    await hsePage.searchInput.fill('бакалавриат');
    // Проверяем, что кнопка поиска стала активной/видимой после ввода
    await expect(hsePage.searchButton).toBeVisible();
  });

  // 2. Проверка наличия основного раздела "Образование" в главном меню
  test('Тест 2: Ссылка на раздел "Образование"', async () => {
    await expect(hsePage.educationLink).toBeVisible();
    // Дополнительная проверка: убедимся, что ссылка действительно ведет на нужный URL
    await expect(hsePage.educationLink).toHaveAttribute('href', /education/);
  });
