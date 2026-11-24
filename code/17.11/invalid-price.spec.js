
const { test, expect } = require('@playwright/test');

test('Test 8: Add product with invalid price', async ({ page }) => {
    await page.goto('https://commitquality.com/');

    // Переходим на страницу добавления продукта
    await page.getByRole('link', { name: /add product/i }).click();

    const form = page.locator('form');

    // Заполняем название продукта
    await form.locator('input').nth(0).fill('Test Invalid Price');

    // Вводим отрицательную цену
    const priceInput = page.getByTestId('price-textbox');
    await priceInput.fill('-100');

    // Заполняем дату, если такое поле есть
    const dateInput = form.locator('input[type="date"]');

    if (await dateInput.count() > 0) {
        await dateInput.fill('2026-11-17');
    }

    // Запоминаем POST-ответы сервера
    const responses = [];

    page.on('response', response => {
        if (response.request().method() === 'POST') {
            responses.push(response.status());
        }
    });

    // Отправляем форму
    await form.locator('button[type="submit"]').click();

    // Даём приложению время обработать отправку
    await page.waitForTimeout(1500);

    // Проверяем, что продукт не был успешно создан
    expect(
        responses.some(status => status >= 200 && status < 300)
    ).toBeFalsy();
});
