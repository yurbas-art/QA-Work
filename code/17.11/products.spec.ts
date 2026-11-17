import { test, expect } from '@playwright/test';
import { ProductsPage } from '../ProductsPage';

test.describe('3. Поиск и фильтрация продуктов / Удаление', () => {

  test('Тест 10. Удаление существующего продукта', async ({ page, request }) => {
    const uniqueName = `ProductToDelete_${Date.now()}`;
    const createResp = await request.post('/api/products', { data: { name: uniqueName } });
    expect(createResp.ok()).toBeTruthy();
    const createdProduct = await createResp.json();
    const productId = createdProduct.id;

    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    const deleteRequestPromise = page.waitForResponse(response =>
      response.url().includes(`/api/products/${productId}`) &&
      response.request().method() === 'DELETE' &&
      response.ok()
    );

    await productsPage.deleteProductByName(uniqueName);
    await productsPage.confirmDeletion();

    const deleteResponse = await deleteRequestPromise;
    expect(deleteResponse.status()).toBeLessThan(300);

    await page.reload();
    await expect(productsPage.productRows.filter({ hasText: uniqueName })).toHaveCount(0);
  });

  test('Тест 11. Фильтрация продуктов по названию', async ({ page, request }) => {
    const uniqueName = `FilterTarget_${Date.now()}`;
    await request.post('/api/products', { data: { name: uniqueName } });

    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    const filterRequestPromise = page.waitForRequest(req =>
      req.url().includes('/api/products') &&
      req.method() === 'GET' &&
      req.url().includes(uniqueName)
    );

    await productsPage.filterByName(uniqueName);

    const filterRequest = await filterRequestPromise;
    expect(filterRequest.url()).toContain(uniqueName);

    await expect(productsPage.productRows.first()).toBeVisible();
    await expect(productsPage.productRows.filter({ hasText: uniqueName })).toHaveCount(1);
  });

  test('Тест 12. Фильтрация по несуществующему продукту', async ({ page }) => {
    const productsPage = new ProductsPage(page);
    await productsPage.goto();

    const filterResponsePromise = page.waitForResponse(response =>
      response.url().includes('/api/products') &&
      response.request().method() === 'GET' &&
      response.ok()
    );

    await productsPage.filterByName('NonExistentProduct_XYZ_12345');

    const filterResponse = await filterResponsePromise;
    expect(filterResponse.ok()).toBeTruthy();

    await expect(productsPage.productRows).toHaveCount(0);
    await expect(productsPage.emptyState).toBeVisible();
  });
});
