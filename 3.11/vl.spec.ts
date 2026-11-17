import { test, expect, Page } from '@playwright/test';

const BASE_URL = 'https://vl.ru';

test.use({
  browserName: 'firefox',
  locale: 'ru-RU',
  viewport: { width: 1920, height: 1080 },
});

// TC-06. Открытие новости из ленты
test('TC-06: открытие новости из ленты', async ({ page }) => {
  await page.goto(BASE_URL);

  // Первая новость в блоке «Новости Владивостока на VL.ru»
  const firstNews = page.locator("h2 a[href*='newsvl.ru']").first();
  await expect(firstNews).toBeVisible();
  const feedTitle = ((await firstNews.innerText()) || '').replace(/\s+/g, ' ').trim();
  expect(feedTitle, 'Заголовок первой новости в ленте пустой').not.toBe('');

  // Клик по заголовку (новость может открыться в новой вкладке)
  let newsPage: Page = page;
  if ((await firstNews.getAttribute('target')) === '_blank') {
    const [popup] = await Promise.all([page.waitForEvent('popup'), firstNews.click()]);
    newsPage = popup;
  } else {
    await firstNews.click();
  }
  await newsPage.waitForLoadState('domcontentloaded');

  // Открылась страница новости на newsvl.ru, не страница ошибки
  expect(newsPage.url()).toContain('newsvl.ru');
  expect(await newsPage.title()).not.toContain('404');

  // Заголовок совпадает с заголовком в ленте
  const h1 = newsPage.locator('h1').first();
  await expect(h1).toBeVisible();
  const h1Text = ((await h1.innerText()) || '').replace(/\s+/g, ' ');
  expect(h1Text).toContain(feedTitle.slice(0, 40));

  // Есть текст, дата/время и изображение
  const bodyText = await newsPage.locator('body').innerText();
  expect(bodyText.length).toBeGreaterThan(300);
  expect(bodyText).toMatch(/\d{1,2}[:.]\d{2}|\d{4}/);
  expect(await newsPage.locator('img').count()).toBeGreaterThan(0);
});

// TC-07. Голосование в опросе без выбора варианта ответа
test('TC-07: голосование в опросе без выбора варианта', async ({ page }) => {
  await page.goto(BASE_URL);

  // Блок «Опрос» и кнопка «Голосовать»
  const voteButton = page.getByRole('button', { name: 'Голосовать' }).first();
  await voteButton.scrollIntoViewIfNeeded();
  await expect(voteButton).toBeVisible();

  // Ни один вариант ответа не выбран
  const form = voteButton.locator('xpath=ancestor::form');
  const options = form.locator('input[type=radio], input[type=checkbox]');
  const count = await options.count();
  expect(count, 'В опросе не найдены варианты ответа').toBeGreaterThan(0);
  for (let i = 0; i < count; i++) {
    await expect(options.nth(i)).not.toBeChecked();
  }

  const urlBefore = page.url();

  // Нажать «Голосовать», ничего не выбирая
  await voteButton.click();

  // Браузер показал предупреждение (в Firefox: «Пожалуйста, выберите один из этих параметров»)
  const message = await options
    .first()
    .evaluate((el) => (el as HTMLInputElement).validationMessage);
  expect(message, 'Предупреждение браузера не появилось').not.toBe('');

  // Форма не отправилась, голос не засчитан
  expect(page.url()).toBe(urlBefore);
  for (let i = 0; i < count; i++) {
    await expect(options.nth(i)).not.toBeChecked();
  }
});
