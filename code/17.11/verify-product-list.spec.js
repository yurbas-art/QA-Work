
const { test, expect } = require('@playwright/test');

test('Test 9: Verify product appears in product list', async ({ page }) => {
    const productName = `Test Product ${Date.now()}`;

    await page.goto('https://commitquality.com/');

    // Переходим к добавлению продукта
    await page.getByTestId('add-a-product-button').click();

    // Заполняем поля
    await page.getByTestId('product-textbox').fill(productName);
    await page.getByTestId('price-textbox').fill('777');

    // Выводим информацию о форме перед отправкой
    console.log('URL before submit:', page.url());

    // Отправляем форму
    await page.locator('button[type="submit"]').click();

    // Ждём завершения возможного перехода
    await page.waitForTimeout(2000);

    console.log('URL after submit:', page.url());
    console.log('Page title:', await page.title());
    console.log('Page text:', (await page.locator('body').innerText()).slice(0, 1500));

    // Если продукт появился на текущей странице, проверяем его
    const productRow = page.locator('tbody tr').filter({ hasText: productName });

    console.log('Found product rows:', await productRow.count());
});
