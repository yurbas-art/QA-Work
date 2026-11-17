import { test, expect } from '@playwright/test';

const BASE_URL = 'https://commitquality.com';



function generateUniqueProductName(prefix: string) {
    return `${prefix}-${Date.now()}`;
}

test.describe('CommitQuality E2E', () => {


    
    // Тест 13: Сброс фильтрации
    test('Сброс фильтрации возвращает полный список продуктов', async ({ page }) => {
        await page.goto(`${BASE_URL}`);

        const filterInput = page.locator('input[placeholder="Filter by product name"]'); // <-- замените при необходимости

        const filterButton = page.getByRole('button', { name: /filter/i });
        const resetButton = page.getByRole('button', { name: /reset/i });

        // Применяем фильтр
        await filterInput.fill('Product 1');
        await filterButton.click();

        // Ждём, пока таблица отфильтруется
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

        await page.goto(`${BASE_URL}/add-product`);

        // Заполнение формы через getByLabel (наиболее вероятный вариант)
        await page.getByLabel(/name/i).fill(productName);
        await page.getByLabel(/price/i).fill('99.99');
        await page.getByLabel(/date stocked/i).fill(testDate);
        await page.getByRole('button', { name: /submit|add/i }).click();

        // Ждём завершения навигации/запроса, затем проверяем результат
        await page.waitForURL(/\/products$/);

        const productRow = page.locator('table tbody tr', { hasText: productName });
        await expect(productRow).toContainText(testDate);
    });

    // Тест 15: Проверка обработки отрицательной цены
    test('Отрицательная цена отклоняется сервером', async ({ page }) => {
        const productName = generateUniqueProductName('NegativePrice');

        await page.goto(`${BASE_URL}/add-product`);

        // Заполняем форму с отрицательной ценой
        await page.getByLabel(/name/i).fill(productName);
        await page.getByLabel(/price/i).fill('-50');
        await page.getByLabel(/date stocked/i).fill('2024-05-20');
        await page.getByRole('button', { name: /submit|add/i }).click();

        // Переходим на страницу продуктов для проверки
        await page.goto(`${BASE_URL}`);

        // Проверяем, что продукт не появился в таблице
        const productRow = page.locator('table tbody tr', { hasText: productName });
        await expect(productRow).toHaveCount(0);
    });

});