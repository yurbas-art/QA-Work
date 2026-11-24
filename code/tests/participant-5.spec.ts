import { test, expect } from '@playwright/test';

test('Страница контактов открывается', async ({ page }) => {
  await page.goto('https://student.itmo.ru/ru/contacts');

  await expect(
    page.getByRole('heading', { name: /КОНТАКТЫ/i })
  ).toBeVisible();
});

test('В списке подразделений есть Студенческий офис', async ({ page }) => {
  await page.goto('https://student.itmo.ru/ru/contacts');

  await expect(
    page.getByText('Студенческий офис', { exact: true }).first()
  ).toBeVisible();
});

test('Указана электронная почта студенческого офиса', async ({ page }) => {
  await page.goto('https://student.itmo.ru/ru/contacts');

  await expect(
    page.getByText('so@itmo.ru', { exact: true })
  ).toBeVisible();
});
