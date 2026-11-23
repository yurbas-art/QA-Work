import { test, expect } from '@playwright/test';

test('Главная страница ИТМО загружается', async ({ page }) => {
  await page.goto('/ru/');

  await expect(page).toHaveTitle(/ИТМО|Университет/i);

  await expect(
    page.getByRole('heading', {
      name: /Национальный исследовательский университет ИТМО/i
    })
  ).toBeVisible();
});

test('Переход в раздел для абитуриентов', async ({ page }) => {
  await page.goto('/ru/');

  await page.getByRole('link', {
    name: /Абитуриентам/i
  }).first().click();

  await expect(page).toHaveURL(/abit\.itmo\.ru/);
});

test('На главной странице присутствует раздел образования', async ({ page }) => {
  await page.goto('/ru/');

  await expect(
    page.getByText('ОБРАЗОВАНИЕ', { exact: true }).first()
  ).toBeVisible();
});
