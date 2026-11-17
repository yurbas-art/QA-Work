import { test, expect } from '@playwright/test';
import { login } from './helpers';

test('Тест 5. Получение списка продуктов', async ({ page }) => {
  await login(page);
  await page.goto('/');

  // заголовки колонок
  for (const title of ['ID', 'Name', 'Price', 'Date Stocked']) {
    await expect(page.getByText(title, { exact: true }).first()).toBeVisible();
  }

  // данные загружены: кроме строки заголовка есть строки с продуктами
  const rows = page.getByRole('row');
  await expect.poll(async () => await rows.count()).toBeGreaterThan(1);

  // в первой строке с данными заполнены все ячейки
  const firstDataRow = rows.nth(1);
  const cells = firstDataRow.getByRole('cell');
  await expect(cells.first()).not.toBeEmpty();
  const count = await cells.count();
  for (let i = 0; i < Math.min(count, 4); i++) {
    await expect(cells.nth(i)).not.toBeEmpty();
  }
});