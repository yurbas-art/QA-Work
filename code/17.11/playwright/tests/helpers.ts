import { Page, expect } from '@playwright/test';

export const LOGIN_PATH = '/login';
export const USER = process.env.TEST_USER ?? 'test';
export const PASSWORD = process.env.TEST_PASSWORD ?? 'test';

export function logoutControl(page: Page) {
  return page
    .getByRole('link', { name: /log\s?out/i })
    .or(page.getByRole('button', { name: /log\s?out/i }));
}

export async function login(page: Page) {
  await page.goto(LOGIN_PATH);
  await page.getByPlaceholder('Enter Username').fill(USER);
  await page.getByPlaceholder('Enter Password').fill(PASSWORD);
  await page.getByRole('button', { name: 'Login' }).click();
  await expect(logoutControl(page)).toBeVisible();
}