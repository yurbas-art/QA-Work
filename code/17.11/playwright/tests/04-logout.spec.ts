import { test, expect } from '@playwright/test';
import { login, logoutControl } from './helpers';

test('Тест 4. Выход из аккаунта', async ({ page }) => {
  await login(page);

  await logoutControl(page).click();

  // сессия завершена: Logout исчез, в меню снова Login
  await expect(logoutControl(page)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();

  // повторно открываем другую страницу без авторизации
  await page.goto('/add-product');
  await expect(logoutControl(page)).toHaveCount(0);
  await expect(page.getByRole('link', { name: 'Login' })).toBeVisible();
});