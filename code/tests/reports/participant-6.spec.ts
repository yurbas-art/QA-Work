import { test, expect } from '@playwright/test';

test('Пользователь может перейти от главной страницы к бакалавриату', async ({ page }) => {
  await page.goto('https://itmo.ru/ru/');

  await page.getByRole('link', {
    name: /Абитуриентам/i
  }).first().click();

  await expect(page).toHaveURL(/abit\.itmo\.ru/);

  await page.goto('https://abit.itmo.ru/programs/bachelor');

  await expect(
    page.getByRole('heading', {
      name: /Образовательные программы бакалавриата/i
    })
  ).toBeVisible();
});

test('Пользователь может выполнить поиск программы', async ({ page }) => {
  await page.goto('https://abit.itmo.ru/bachelor');

  const search = page.getByPlaceholder(
    'Например: Информационные технологии'
  );

  await search.fill('Программная инженерия');

  await expect(search).toHaveValue('Программная инженерия');

  await search.press('Enter');

  await expect(
    page.getByText('Программная инженерия', { exact: true }).first()
  ).toBeVisible();
});

test('Студенческий портал доступен', async ({ page }) => {
  await page.goto('https://student.itmo.ru/ru/contacts');

  await expect(page).toHaveURL(/student\.itmo\.ru\/ru\/contacts/);

  await expect(
    page.getByRole('heading', { name: /КОНТАКТЫ/i })
  ).toBeVisible();
});
