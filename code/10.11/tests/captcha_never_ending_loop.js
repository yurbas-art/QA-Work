import { test, expect } from '@playwright/test';

test.describe('Баг ID 3: Бесконечный цикл капчи при входе', () => {

  test('Страница логина содержит капчу, блокирующую вход', async ({ page }) => {
    await page.goto('/login');

    const loginInput = page.locator('input[name="login"], input[name="username"]').first();
    const passwordInput = page.locator('input[name="password"]').first();

    await loginInput.fill('test_user_12345');
    await passwordInput.fill('wrong_password_123');

    const captcha = page.locator('div.captcha, iframe[src*="captcha"], [class*="captcha"]').first();
    await expect(captcha).toBeVisible({ timeout: 10000 });
  });

});

