const { test, expect } = require('@playwright/test');

test('Test 7: Add product with empty fields', async ({ page }) => {
    await page.goto('https://commitquality.com/');

    // Переход на страницу добавления продукта
    await page.getByRole('link', { name: /add product/i }).click();

    // Находим форму
    const form = page.locator('form');

    // Проверяем, что форма существует
    await expect(form).toBeVisible();

    // Перехватываем ответы сервера
    const responses = [];

    page.on('response', response => {
        if (/product/i.test(response.url()) &&
            ['POST', 'PUT', 'PATCH'].includes(response.request().method())) {
            responses.push(response.status());
        }
    });

    // Отправляем пустую форму
    await form.locator('button[type="submit"]').click();

    // Проверяем, что форма не прошла валидацию
    const invalidFields = await form.locator(':invalid').count();

    expect(invalidFields).toBeGreaterThan(0);

    // Проверяем, что продукт не был успешно создан
    expect(responses.some(status => status >= 200 && status < 300))
        .toBeFalsy();
});
