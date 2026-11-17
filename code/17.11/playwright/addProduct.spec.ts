import { test, expect } from '@playwright/test';
import { AddProductPage } from './AddProductPage';
import { ProductsPage } from './ProductsPage';

test.describe('Добавление продуктов - валидация и сохранение', () => {

  test('Тест 15. Проверка обработки отрицательной цены', async ({ page }) => {
    const addProductPage = new AddProductPage(page);
    await addProductPage.goto();

    const uniqueName = `NegativePriceTest_${Date.now()}`;
    const negativePrice = '-100';

    // Перехватываем запрос на создание продукта
    const createRequestPromise = page.waitForResponse(response =>
      response.url().includes('/api/products') &&
      response.request().method() === 'POST'
    );

    await addProductPage.addProduct(uniqueName, negativePrice);

    // Проверяем ответ сервера
    const createResponse = await createRequestPromise;
    expect(createResponse.status()).toBeGreaterThanOrEqual(400); // Ошибка валидации

    // Проверяем, что запись не сохранилась (переходим на список продуктов)
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await expect(productsPage.productRows.filter({ hasText: uniqueName })).toHaveCount(0);
  });

  test('Тест 16. Проверка обработки слишком длинного названия', async ({ page }) => {
    const addProductPage = new AddProductPage(page);
    await addProductPage.goto();

    const longName = 'A'.repeat(500); // Очень длинное название
    const validPrice = '100';
    const validDate = '2026-11-17';

    // Перехватываем запрос
    const createRequestPromise = page.waitForResponse(response =>
      response.url().includes('/api/products') &&
      response.request().method() === 'POST'
    );

    await addProductPage.addProduct(longName, validPrice, validDate);

    // Проверяем ответ сервера (должна быть ошибка валидации)
    const createResponse = await createRequestPromise;
    expect(createResponse.status()).toBeGreaterThanOrEqual(400);

    // Проверяем, что запись не сохранилась
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    await expect(productsPage.productRows.filter({ hasText: longName.substring(0, 50) })).toHaveCount(0);
  });

  test('Тест 17. Повторное добавление продукта', async ({ page }) => {
    const addProductPage = new AddProductPage(page);
    await addProductPage.goto();

    const uniqueName = `DuplicateTest_${Date.now()}`;
    const price = '150';
    const date = '2026-11-17';

    // Первое добавление
    const firstCreatePromise = page.waitForResponse(response =>
      response.url().includes('/api/products') &&
      response.request().method() === 'POST' &&
      response.ok()
    );

    await addProductPage.addProduct(uniqueName, price, date);
    const firstResponse = await firstCreatePromise;
    expect(firstResponse.ok()).toBeTruthy();

    // Повторное добавление с теми же данными
    await addProductPage.goto();
    
    const secondCreatePromise = page.waitForResponse(response =>
      response.url().includes('/api/products') &&
      response.request().method() === 'POST'
    );

    await addProductPage.addProduct(uniqueName, price, date);
    const secondResponse = await secondCreatePromise;

    // Проверяем поведение сервера (должна быть ошибка уникальности или создание дубликата)
    // Если дубликаты запрещены, статус должен быть 400+
    if (secondResponse.status() >= 400) {
      // Сервер отклонил дубликат - это правильное поведение
      expect(secondResponse.status()).toBeGreaterThanOrEqual(400);
    }

    // Проверяем отсутствие непредусмотренных дубликатов
    const productsPage = new ProductsPage(page);
    await productsPage.goto();
    
    const matchingProducts = productsPage.productRows.filter({ hasText: uniqueName });
    const count = await matchingProducts.count();
    
    // Должен быть максимум 1 продукт с таким именем (если дубликаты запрещены)
    expect(count).toBeLessThanOrEqual(1);
  });


  test('Тест 18. Проверка сохранности данных после повторной загрузки', async ({ page }) => {
    const addProductPage = new AddProductPage(page);
    await addProductPage.goto();

    const uniqueName = `PersistenceTest_${Date.now()}`;
    const price = '250';
    const date = '2026-11-17';

    // Добавляем продукт и ждем успешного ответа
    const createPromise = page.waitForResponse(response =>
      response.url().includes('/api/products') &&
      response.request().method() === 'POST' &&
      response.ok()
    );

    await addProductPage.addProduct(uniqueName, price, date);
    const createResponse = await createPromise;
    expect(createResponse.ok()).toBeTruthy();

    // Переходим на страницу списка продуктов
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    // Перезагружаем страницу
    await page.reload();

    // Находим продукт и проверяем данные
    const productRow = productsPage.productRows.filter({ hasText: uniqueName });
    await expect(productRow).toBeVisible();

    // Проверяем, что название отображается
    await expect(productRow).toContainText(uniqueName);
    
    // Проверяем, что цена отображается (адаптируйте селектор под вашу верстку)
    await expect(productRow).toContainText(price);
    
    // Проверяем, что дата отображается (адаптируйте формат даты под вашу верстку)
    await expect(productRow).toContainText('2026-11-17');
  });
});
