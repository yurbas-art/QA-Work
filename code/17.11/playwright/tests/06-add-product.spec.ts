import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('Тест 6. Добавление нового продукта', async ({ page }) => {
  await login(page);

  const name = `Test product ${Date.now()}`;
  const price = '123';
  const dateStocked = '2025-01-15'; // дата в прошлом: сайт не принимает будущие

  await page.goto('/add-product');

  await page.locator('#name').fill(name);
  await page.locator('#price').fill(price);
  await page.locator('#dateStocked').fill(dateStocked);

  await page.locator('form').getByRole('button', { name: 'Submit' }).click();

  // форма принята: нет ошибок валидации
  await expect(page.getByText('Date must not be in the future.')).toHaveCount(0);
  await expect(page.getByText('Errors must be resolved before submitting')).toHaveCount(0);

  // идём в список через меню (без перезагрузки страницы)
  await page.getByRole('link', { name: 'Products' }).click();

  // ищем новый продукт через фильтр
  await page.getByPlaceholder('Filter by product name').or(
    page.getByRole('textbox', { name: 'Filter by product name' }),
  ).first().fill(name);
  await page.getByRole('button', { name: 'Filter' }).click();

  // продукт найден, данные совпадают с введёнными
  const row = page.getByRole('row').filter({ hasText: name });
  await expect(row).toBeVisible();
  await expect(row).toContainText(price);
  await expect(row).toContainText(dateStocked);
});
