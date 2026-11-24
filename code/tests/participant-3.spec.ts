import { test, expect } from '@playwright/test';

test('Каталог бакалавриата открывается', async ({ page }) => {
  await page.goto('https://abit.itmo.ru/programs/bachelor');

  await expect(
    page.getByRole('heading', {
      name: /Образовательные программы бакалавриата/i
    })
  ).toBeVisible();
});

test('В каталоге присутствует Программная инженерия', async ({ page }) => {
  await page.goto('https://abit.itmo.ru/programs/bachelor');

  await expect(
    page.getByText('Программная инженерия', { exact: true }).first()
  ).toBeVisible();
});

test('В каталоге присутствует информация о направлениях', async ({ page }) => {
  await page.goto('https://abit.itmo.ru/programs/bachelor');

  await expect(
    page.getByText('Направления', { exact: true }).first()
  ).toBeVisible();
});
