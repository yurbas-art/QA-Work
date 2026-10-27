import { test, expect } from '@playwright/test';
import {
  openPopup,
  mockForms,
  trackFormRequests,
  fillForm,
  submit,
  dismissCookies,
  consentInput,
  consentClick,
  ERRORS,
  SUCCESS,
  LIVE,
} from './helpers';

test.beforeEach(async ({ page }, testInfo) => {
  const id = testInfo.title.split(' ')[0];
  testInfo.annotations.push({ type: 'test-case', description: id });
  await mockForms(page);
  await page.goto('/');
  await dismissCookies(page);
});

test('FORM-01 Отправка формы «Заказать звонок» с валидным телефоном', async ({ page }) => {
  const sent = trackFormRequests(page);
  const popup = await openPopup(page, '#zakaz-zvonok');

  await fillForm(popup, { name: 'ТЕСТ' });
  await submit(popup);

  await expect.poll(() => sent.length, { timeout: 10_000 }).toBeGreaterThan(0);
  expect(sent[0]).toContain('ТЕСТ');
  await expect(popup.locator(ERRORS)).toHaveCount(0);
  // в подменённом режиме Tilda не показывает блок успеха, проверяем только при LIVE_SUBMIT=1
  if (LIVE) await expect(page.locator(SUCCESS).first()).toBeVisible({ timeout: 15_000 });
});

test('FORM-02 Отправка формы «Быстрый заказ» с вложением', async ({ page }) => {
  const sent = trackFormRequests(page);
  const popup = await openPopup(page, '#bistriy-zakaz');

  await fillForm(popup, { text: 'ТЕСТ продукция' });

  // test.pdf создаётся прямо в памяти, отдельный файл не нужен
  const pdf = {
    name: 'test.pdf',
    mimeType: 'application/pdf',
    buffer: Buffer.from('%PDF-1.4\n1 0 obj<<>>endobj\ntrailer<<>>\n%%EOF'),
  };
  const fileInput = page.locator('input[type="file"]').first();
  if (await fileInput.count()) {
    await fileInput.setInputFiles(pdf);
  } else {
    const chooserPromise = page.waitForEvent('filechooser', { timeout: 5000 }).catch(() => null);
    await popup.getByText('Прикрепить файл').first().click();
    const chooser = await chooserPromise;
    test.fixme(!chooser, 'Виджет загрузки не отдаёт filechooser: проверить вручную');
    await chooser!.setFiles(pdf);
  }
  await expect(popup.getByText(/test\.pdf/)).toBeVisible({ timeout: 15_000 });

  await submit(popup);
  await expect.poll(() => sent.length, { timeout: 10_000 }).toBeGreaterThan(0);
  expect(sent[0]).toContain('ТЕСТ продукция');
  await expect(popup.locator(ERRORS)).toHaveCount(0);
  // «вложение доступно получателю» проверяется вручную
});

test('FORM-03 Отправка формы «Получить коммерческое предложение»', async ({ page }) => {
  const sent = trackFormRequests(page);
  const popup = await openPopup(page, '#polychit-KP');

  await fillForm(popup);
  await submit(popup);

  await expect.poll(() => sent.length, { timeout: 10_000 }).toBeGreaterThan(0);
  expect(sent[0]).toContain('ТЕСТ');
  await expect(popup.locator(ERRORS)).toHaveCount(0);
  // в подменённом режиме Tilda не показывает блок успеха, проверяем только при LIVE_SUBMIT=1
  if (LIVE) await expect(page.locator(SUCCESS).first()).toBeVisible({ timeout: 15_000 });
});

test('FORM-04 Валидация пустого телефона в форме «Заказать звонок»', async ({ page }) => {
  const sent = trackFormRequests(page);
  const popup = await openPopup(page, '#zakaz-zvonok');

  await fillForm(popup, { withPhone: false }); // телефон не заполняем
  await submit(popup);

  await expect(popup.locator(ERRORS).first()).toBeVisible();
  await page.waitForTimeout(1500);
  expect(sent, 'форма не должна отправляться').toHaveLength(0);
});

test('FORM-05 Работа чекбокса согласия с политикой конфиденциальности', async ({ page }) => {
  const sent = trackFormRequests(page);
  const popup = await openPopup(page, '#polychit-KP'); // чекбокс есть только в этой форме
  const box = consentInput(popup);
  await expect(box).toBeAttached();

  const initial = await box.isChecked();
  await consentClick(popup);
  expect(await box.isChecked()).toBe(!initial); // переключился
  await consentClick(popup);
  expect(await box.isChecked()).toBe(initial); // вернулся

  // снимаем согласие и пробуем отправить с валидными данными
  if (initial) await consentClick(popup);
  expect(await box.isChecked()).toBe(false);
  await fillForm(popup, { consent: false });
  await submit(popup);

  await expect(popup.locator(ERRORS).first()).toBeVisible();
  await page.waitForTimeout(1500);
  expect(sent, 'без согласия отправка должна блокироваться').toHaveLength(0);
});

test.describe('мобильный viewport', () => {
  test.use({ viewport: { width: 390, height: 844 }, hasTouch: true });

  test('FORM-06 Открытие и закрытие поп-ап форм на мобильном экране', async ({ page }) => {
    for (const hash of ['#zakaz-zvonok', '#bistriy-zakaz']) {
      const popup = await openPopup(page, hash);

      const close = page.locator('.t-popup__close-wrapper:visible').first();
      await expect(close).toBeVisible();
      for (const el of [close, popup.locator('button[type="submit"], .t-submit').first()]) {
        const b = await el.boundingBox();
        expect(b, 'элемент не найден').not.toBeNull();
        expect(b!.x).toBeGreaterThanOrEqual(0);
        expect(b!.x + b!.width).toBeLessThanOrEqual(390);
      }

      await close.click();
      await expect(page.locator('.t-popup_show')).toHaveCount(0);
    }
  });
});
