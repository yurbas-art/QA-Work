import { test, expect } from '@playwright/test';

test.describe('Штатный сценарий: Главная страница farpost.ru', () => {

  test('Главная страница загружается и содержит ключевые элементы', async ({ page }) => {
    await page.goto('/');

    await expect(page).toHaveTitle(/Farpost/i);

    const searchInput = page.locator('input[name="query"]').first();
    await expect(searchInput).toBeVisible();

    const searchButton = page.getByRole('button', { name: /Найти/i }).first();
    await expect(searchButton).toBeVisible();

    const logo = page.locator('a[href="/"] img').first();
    await expect(logo).toBeVisible();
  });

});
