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

  // 3. Проверка блока "Новости" на главной странице
  test('Тест 3: Наличие блока новостей и первой новости', async () => {
    await expect(hsePage.newsSection).toBeVisible();
    // Проверяем, что внутри секции есть хотя бы одна карточка новости со ссылкой
    await expect(hsePage.firstNewsLink).toBeVisible();
    await expect(hsePage.firstNewsLink).toHaveAttribute('href', /\/news\//);
  });

  // 5. Проверка ссылок на социальные сети в футере (например, ВКонтакте или Telegram)
  test('Тест 5: Ссылка на соцсети ВШЭ в футере', async () => {
    await hsePage.scrollToBottom();
    // Ищем ссылку, содержащую текст "ВКонтакте" или иконку VK
    await expect(hsePage.vkSocialLink).toBeVisible();
    await expect(hsePage.vkSocialLink).toHaveAttribute('href', /vk\.com/);
  });
