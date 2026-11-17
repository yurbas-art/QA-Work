import { test, expect } from '@playwright/test';

const BASE_URL = 'https://commitquality.com';

// Вспомогательная функция для генерации уникальных данных (изоляция тестов)
function generateUniqueProductName(prefix: string) {
    return `${prefix}-${Date.now()}`;
}

test.describe('CommitQuality E2E', () => {

    // Тест 13: Сброс фильтрации
    test('Сброс фильтрации возвращает полный список продуктов', async ({ page }) => {
        await page.goto(`${BASE_URL}/products`);

        // Используем семантический локатор для поля поиска (best practice: getByPlaceholder)
        const filterInput = page.getByPlaceholder(/filter by product name/i);
        const filterButton = page.getByRole('button', { name: /filter/i });
        const resetButton = page.getByRole('button', { name: /reset/i });

        // Применяем фильтр
        await filterInput.fill('Product 1');
        await filterButton.click();

        // Веб-ориентированный ассершен: ждём, пока таблица отфильтруется
        const productRows = page.locator('table tbody tr');
        await expect(productRows.first()).toContainText('Product 1');

        // Сбрасываем фильтр
        await resetButton.click();

        // Проверяем, что поле очистилось и вернулся полный список
        await expect(filterInput).toBeEmpty();
        await expect(page.locator('table tbody')).toContainText('Product 2');
    });

    // Тест 14: Проверка сохранения даты поступления продукта
    test('Дата поступления сохраняется и корректно отображается', async ({ page }) => {
        const productName = generateUniqueProductName('DateTest');
        const testDate = '2024-05-20';

        await page.goto(`${BASE_URL}/products/add`);

        // Заполнение формы через getByLabel (best practice для форм)
        await page.getByLabel(/name/i).fill(productName);
        await page.getByLabel(/price/i).fill('99.99');
        await page.getByLabel(/date stocked/i).fill(testDate);
        await page.getByRole('button', { name: /submit|add/i }).click();

        // Ждём завершения навигации/запроса, затем проверяем результат на странице списка
        await page.waitForURL(/\/products$/);

        const productRow = page.locator('table tbody tr', { hasText: productName });
        await expect(productRow).toContainText(testDate);
    });

    // Тест 15: Проверка обработки отрицательной цены
    test('Отрицательная цена отклоняется сервером', async ({ page }) => {
        const productName = generateUniqueProductName('NegativePrice');

        await page.goto(`${BASE_URL}/products/add`);

        // Заполняем форму с отрицательной ценой
        await page.getByLabel(/name/i).fill(productName);
        await page.getByLabel(/price/i).fill('-50');
        await page.getByLabel(/date stocked/i).fill('2024-05-20');
        await page.getByRole('button', { name: /submit|add/i }).click();

        // Ждём возврата на страницу списка (или появления ошибки, в зависимости от реализации)
        // В данном случае предполагаем, что при ошибке пользователь остаётся на форме или возвращается
        // Поэтому для надёжности просто переходим на страницу продуктов и проверяем отсутствие записи
        await page.goto(`${BASE_URL}/products`);

        // Веб-ориентированный ассершен: продукт не должен появиться в таблице
        const productRow = page.locator('table tbody tr', { hasText: productName });
        await expect(productRow).toHaveCount(0);
    });

});