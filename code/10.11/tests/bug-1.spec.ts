import { test, expect } from '@playwright/test';

test.describe('Баг ID 1: Дублирование атрибута id', () => {

  test('На главной странице не должно быть дубликатов id', async ({ page }) => {
    await page.goto('/');

    const duplicates = await page.evaluate(() => {
      const counts: Record<string, number> = {};
      const dups: Array<[string, number]> = [];
      document.querySelectorAll('[id]').forEach(el => {
        counts[el.id] = (counts[el.id] || 0) + 1;
      });
      for (const key in counts) {
        if (counts[key] > 1) dups.push([key, counts[key]]);
      }
      return dups;
    });

    console.log('Найденные дубликаты ID:', duplicates);
    expect(duplicates, `Найдены дубликаты: ${JSON.stringify(duplicates)}`).toEqual([]);
  });

});
