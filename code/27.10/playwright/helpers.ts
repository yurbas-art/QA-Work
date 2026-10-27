import { Page, Locator, expect } from '@playwright/test';

/** LIVE_SUBMIT=1 → заявки уходят по-настоящему. По умолчанию запрос подменяется. */
export const LIVE = process.env.LIVE_SUBMIT === '1';
export const TEST_PHONE = process.env.TEST_PHONE ?? '9000000000';
export const FORM_API = /forms\.tilda[a-z]*\.(com|net|ru)|\/procces\//;

export const ERRORS =
  '.t-input-error:visible, .js-errorbox-all:visible, .t-form__errorbox-middle:visible';
export const SUCCESS = '.t-form__successbox:visible, .js-successbox:visible';

export async function dismissCookies(page: Page) {
  const btn = page.getByText('Согласен', { exact: true });
  if (await btn.isVisible().catch(() => false)) await btn.click();
}

/** Открывает попап по якорю: берёт ссылку, которая реально в экране (на сайте есть карусели); на мобильном при необходимости раскрывает бургер. */
export async function openPopup(page: Page, hash: string): Promise<Locator> {
  const vp = page.viewportSize() ?? { width: 1280, height: 720 };
  const findIdx = (sel: string) =>
    page.locator(sel).evaluateAll(
      (els, v) =>
        els.findIndex((e) => {
          const r = e.getBoundingClientRect();
          return r.width > 0 && r.right > 0 && r.left < v.width && r.bottom > 0;
        }),
      vp
    );
  const sel = `a[href="${hash}"]`;
  let idx = await findIdx(sel);
  if (idx < 0) {
    const bi = await findIdx('a[href="#menu-mobile"]');
    if (bi >= 0) {
      await page.locator('a[href="#menu-mobile"]').nth(bi).click();
      await page.waitForTimeout(800);
      idx = await findIdx(sel);
    }
  }
  const link = page.locator(sel).nth(Math.max(idx, 0));
  try {
    await link.click({ timeout: 4000 });
  } catch {
    await link.dispatchEvent('click');
  }
  const popup = page.locator('.t-popup_show').first();
  await expect(popup).toBeVisible();
  return popup;
}

/** Подменяет ответ Tilda, чтобы тестовые заявки не попадали в CRM компании. */
export async function mockForms(page: Page) {
  if (LIVE) return;
  await page.route(FORM_API, (route) => {
    const origin = route.request().headers()['origin'] ?? '*';
    return route.fulfill({
      status: 200,
      contentType: 'application/json',
      headers: {
        'access-control-allow-origin': origin,
        'access-control-allow-credentials': 'true',
      },
      body: JSON.stringify({ results: [1] }),
    });
  });
}

/** Собирает все POST-запросы формы. */
export function trackFormRequests(page: Page) {
  const sent: string[] = [];
  page.on('request', (r) => {
    if (FORM_API.test(r.url()) && r.method() === 'POST') {
      let body = r.postData() ?? '';
      try {
        body = decodeURIComponent(body);
      } catch {}
      sent.push(body);
    }
  });
  return sent;
}

export async function fillForm(
  scope: Locator,
  { name = 'ТЕСТ', phone = TEST_PHONE, text = 'ТЕСТ', withPhone = true, consent = true } = {}
) {
  if (withPhone) {
    const tel = scope
      .locator('input[type="tel"], input[name="Phone"], input.t-input-phonemask')
      .first();
    if (await tel.count()) {
      await tel.click();
      await tel.pressSequentially(phone, { delay: 30 });
    }
  }
  const nameInput = scope.locator('input[name="Name"], input[name="name"]').first();
  if (await nameInput.count()) await nameInput.fill(name);

  for (const ta of await scope.locator('textarea:visible').all()) await ta.fill(text);

  for (const inp of await scope.locator('input[type="text"]:visible').all()) {
    if ((await inp.inputValue()) === '') await inp.fill(text);
  }
  const email = scope.locator('input[type="email"]:visible').first();
  if (await email.count()) await email.fill('test@example.com');

  // если в форме есть чекбокс согласия, ставим галочку (кроме случая consent: false)
  if (consent) {
    const box = consentInput(scope);
    if ((await box.count()) && !(await box.isChecked())) await consentClick(scope);
  }
}

export const consentInput = (scope: Locator) => scope.locator('input[type="checkbox"]').first();
export const consentClick = async (scope: Locator) => {
  // клик по подписи может попасть в ссылку «Политика конфиденциальности», поэтому кликаем по самому квадрату
  const indicator = scope.locator('.t-checkbox__indicator').first();
  if (await indicator.count()) await indicator.click();
  else await consentInput(scope).click({ force: true });
};

export async function submit(scope: Locator) {
  await scope.locator('button[type="submit"], .t-submit').first().click();
}

export const hasHorizontalScroll = (page: Page) =>
  page.evaluate(() => document.documentElement.scrollWidth > document.documentElement.clientWidth);
