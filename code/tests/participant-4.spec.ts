import { test, expect } from '@playwright/test';

test('Научный портал открывается', async ({ page }) => {
  await page.goto('https://science.itmo.ru/ru');

  await expect(
    page.getByRole('heading', {
      name: /Наука в университете ИТМО/i
    })
  ).toBeVisible();
});

test('На научном портале присутствует раздел новостей', async ({ page }) => {
  await page.goto('https://science.itmo.ru/ru');

  await expect(
    page.getByText('НОВОСТИ', { exact: true }).first()
  ).toBeVisible();
});

test('Отображается электронная почта научного офиса', async ({ page }) => {
  await page.goto('https://science.itmo.ru/ru');

  await expect(
    page.getByText('science@itmo.ru', { exact: true })
  ).toBeVisible();
});