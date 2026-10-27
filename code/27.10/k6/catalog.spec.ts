import { test, expect, Page } from '@playwright/test';
import { dismissCookies, hasHorizontalScroll } from './helpers';

test.beforeEach(async ({}, testInfo) => {
  testInfo.annotations.push({ type: 'test-case', description: testInfo.title.split(' ')[0] });
});

async function openCatalogMenu(page: Page) {
  const btn = page.locator('a[href="#popup-menu-catalog"]:visible').first();
  try {
    await btn.click({ timeout: 3000 });
  } catch {
    // кнопку перекрывает другой элемент: кликаем программно
    await btn.dispatchEvent('click');
  }
}

test('CAT-01 Переход в категорию «Арматура»', async ({ page }) => {
  await page.goto('/');
  await dismissCookies(page);
  await openCatalogMenu(page);
  await page.locator('a[href$="/catalog/metalloprokat/armatura"]:visible').first().click();

  await expect(page).toHaveURL(/\/armatura/);
  await expect(page.locator('h1').first()).toContainText(/арматур/i);
  await expect(page.locator('body')).toContainText(/А500|А400|А3|АI|AI/);
});

test('CAT-02 Переход в подкатегорию «Труба профильная»', async ({ page }) => {
  await page.goto('/');
  await dismissCookies(page);
  await openCatalogMenu(page);
  await page.locator('a[href$="/catalog/metalloprokat/truby-stalnye"]:visible').first().click();
  await expect(page).toHaveURL(/truby-stalnye/);

  const sub = page.locator('a[href$="/truby-stalnye/truba-profilnaya"]:visible').first();
  if (await sub.count()) {
    await sub.click();
  } else {
    await openCatalogMenu(page);
    await page.locator('a[href$="/truby-stalnye/truba-profilnaya"]:visible').first().click();
  }
  await expect(page).toHaveURL(/truba-profilnaya/);
  await expect(page.locator('h1').first()).toContainText(/профильн/i);
  await expect(page.locator('body')).not.toContainText(/404|страница не найдена/i);
});

test('CAT-03 Скачивание прайс-листа из шапки', async ({ page, request }) => {
  await page.goto('/');
  await dismissCookies(page);
  const link = page.getByRole('link', { name: 'Скачать прайс-лист' }).first();
  const href = await link.getAttribute('href');
  expect(href).toMatch(/disk\.yandex\.ru/);

  // реакция браузера: новая вкладка, скачивание или переход в этой же вкладке
  const none = { kind: 'none', url: '' };
  const reactionPromise = Promise.race([
    page.context().waitForEvent('page', { timeout: 15_000 })
      .then(async (p) => { await p.waitForLoadState('domcontentloaded').catch(() => {}); return { kind: 'new-tab', url: p.url() }; }).catch(() => none),
    page.waitForEvent('download', { timeout: 15_000 })
      .then((d) => ({ kind: 'download', url: d.url() })).catch(() => none),
    page.waitForURL(/disk\.yandex/, { timeout: 15_000 })
      .then(() => ({ kind: 'same-tab', url: page.url() })).catch(() => none),
  ]);
  await link.click();
  const reaction = await reactionPromise;

  test.info().annotations.push({ type: 'reaction', description: `${reaction.kind}: ${reaction.url}` });
  expect(reaction.kind, 'браузер должен среагировать на клик').not.toBe('none');

  // прямой запрос без браузера Яндекс.Диск блокирует (403, антибот), поэтому проверяем, что страница реально открылась
  expect(
    reaction.kind === 'download' || /disk\.yandex/.test(reaction.url),
    `должен открыться Яндекс.Диск или начаться скачивание, получено: ${reaction.kind} ${reaction.url}`
  ).toBe(true);
});

test('CAT-04 Отображение сетки каталога в разных браузерах @cross', async ({ page, browserName }, testInfo) => {
  await page.goto('/catalog/metalloprokat/armatura');
  await dismissCookies(page);
  await page.waitForLoadState('load');
  await page.waitForTimeout(2000);

  await expect(page.locator('h1').first()).toBeVisible();
  expect(await hasHorizontalScroll(page), 'горизонтальный скролл').toBe(false);

  // карточки первого ряда выровнены по верху
  const cards = page.locator('.t-store__card:visible');
  if (await cards.count()) {
    const tops = await cards.evaluateAll((els) =>
      els.map((e) => Math.round(e.getBoundingClientRect().top))
    );
    const row = tops.filter((t) => Math.abs(t - tops[0]) < 5);
    expect(row.every((t) => Math.abs(t - tops[0]) <= 2)).toBe(true);
  }
  const broken = await page.$$eval(
    'img',
    (imgs) => imgs.filter((i) => i.complete && i.naturalWidth === 0 && i.offsetParent !== null).length
  );
  expect(broken, 'битые изображения').toBe(0);

  // скриншот для визуального сравнения Chrome / Safari / Edge в отчёте
  await testInfo.attach(`catalog-${browserName}`, {
    body: await page.screenshot({ fullPage: false }),
    contentType: 'image/png',
  });
});

test.describe('мобильный viewport', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('CAT-05 Адаптивность каталога на мобильном разрешении', async ({ page }) => {
    await page.goto('/catalog/metalloprokat/armatura');
    await dismissCookies(page);
    await page.waitForLoadState('load');
    await page.waitForTimeout(2000);

    expect(await hasHorizontalScroll(page), 'горизонтальный скролл всей страницы').toBe(false);

    const cards = page.locator('.t-store__card:visible');
    if (await cards.count()) {
      const rects = await cards.evaluateAll((els) =>
        els.map((e) => {
          const r = e.getBoundingClientRect();
          return { l: Math.round(r.left), r: Math.round(r.right) };
        })
      );
      expect(new Set(rects.map((r) => r.l)).size, 'колонок должно быть 1–2').toBeLessThanOrEqual(2);
      rects.forEach((r) => expect(r.r).toBeLessThanOrEqual(391));
    }

    const overflowing = await page.$$eval(
      'h1, img:not(.tn-atom__img)', // иконки шапки (zero-block) лежат за экраном и обрезаются
      (els) => els.filter((e) => e.getBoundingClientRect().right > 391).length
    );
    expect(overflowing).toBe(0);
  });
});
