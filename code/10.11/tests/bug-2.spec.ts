import { test, expect } from '@playwright/test';

test.describe('Баг ID 2: Изображения без атрибута alt', () => {

  test('Все изображения на главной должны иметь alt', async ({ page }) => {
    await page.goto('/');

    const imagesWithoutAlt = await page.evaluate(() => {
      return Array.from(document.images)
        .filter(img => !img.hasAttribute('alt'))
        .map(img => img.src);
    });

    console.log('Изображения без alt:', imagesWithoutAlt);
    expect(imagesWithoutAlt, `Изображения без alt: ${JSON.stringify(imagesWithoutAlt)}`).toEqual([]);
  });

});
