import { test, expect, Page } from '@playwright/test';

const CONFIG = {
  loginPath: '/login',
  validUser: { username: 'test', password: 'test' },
  wrongPassword: 'nothing',
};

const ui = {
  username: (p: Page) => p.getByTestId('username-textbox'),
  password: (p: Page) => p.getByTestId('password-textbox'),
  submit: (p: Page) => p.getByTestId('login-button'),
  navLogin: (p: Page) => p.getByTestId('navbar-login'),
  navAccount: (p: Page) => p.getByTestId('navbar-account'),
  navLogout: (p: Page) => p.getByTestId('navbar-logout'),
};

async function login(page: Page, username: string, password: string) {
  await page.goto(CONFIG.loginPath);
  await ui.username(page).fill(username);
  await ui.password(page).fill(password);
  await ui.submit(page).click();
}

function trackApiRequests(page: Page) {
  const requests: string[] = [];
  page.on('request', (r) => {
    if (['fetch', 'xhr'].includes(r.resourceType())) requests.push(`${r.method()} ${r.url()}`);
  });
  return requests;
}

async function storageIsEmpty(page: Page) {
  const local = await page.evaluate(() => Object.keys(localStorage).length);
  const session = await page.evaluate(() => Object.keys(sessionStorage).length);
  const cookies = (await page.context().cookies()).length;
  return local + session + cookies === 0;
}

test.describe('CommitQuality', () => {

  test('Успешная авторизация', async ({ page }) => {
    await login(page, CONFIG.validUser.username, CONFIG.validUser.password);

    await expect(ui.navAccount(page)).toBeVisible();
    await expect(ui.navLogout(page)).toBeVisible();
    await expect(ui.navLogin(page)).toBeHidden();
  });

  test('Авторизация с неверным паролем', async ({ page }) => {
    await login(page, CONFIG.validUser.username, CONFIG.wrongPassword);

    await expect(ui.navLogin(page)).toBeVisible();
    await expect(ui.navLogout(page)).toBeHidden();
    await expect(ui.navAccount(page)).toBeHidden();
    await expect(page).toHaveURL(/\/login/);
    expect(await storageIsEmpty(page)).toBeTruthy();
  });

  test('Авторизация с незаполненными полями', async ({ page }) => {
    const requests = trackApiRequests(page);

    await login(page, '', '');

    await expect(ui.navLogin(page)).toBeVisible();
    await expect(ui.navLogout(page)).toBeHidden();
    await expect(page).toHaveURL(/\/login/);
    expect(await storageIsEmpty(page)).toBeTruthy();

    expect(requests).toHaveLength(0);
  });
});
