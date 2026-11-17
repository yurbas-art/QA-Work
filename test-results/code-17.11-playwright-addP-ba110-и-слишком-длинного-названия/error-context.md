# Instructions

- Following Playwright test failed.
- Explain why, be concise, respect Playwright best practices.
- Provide a snippet of code with the fix, if possible.

# Test info

- Name: code\17.11\playwright\addProduct.spec.ts >> Добавление продуктов - валидация и сохранение >> Тест 16. Проверка обработки слишком длинного названия
- Location: code\17.11\playwright\addProduct.spec.ts:32:3

# Error details

```
Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
Call log:
  - navigating to "/products/add", waiting until "load"

```

# Test source

```ts
  1  | import { Page, Locator } from '@playwright/test';
  2  | 
  3  | export class AddProductPage {
  4  |   readonly page: Page;
  5  |   readonly nameInput: Locator;
  6  |   readonly priceInput: Locator;
  7  |   readonly dateInput: Locator;
  8  |   readonly submitButton: Locator;
  9  |   readonly errorMessage: Locator;
  10 |   readonly successMessage: Locator;
  11 | 
  12 |   constructor(page: Page) {
  13 |     this.page = page;
  14 |     this.nameInput = page.getByPlaceholder('Product name');
  15 |     this.priceInput = page.getByPlaceholder('Price');
  16 |     this.dateInput = page.locator('input[type="date"]');
  17 |     this.submitButton = page.getByRole('button', { name: 'Add Product' });
  18 |     this.errorMessage = page.locator('[data-testid="error-message"]');
  19 |     this.successMessage = page.locator('[data-testid="success-message"]');
  20 |   }
  21 | 
  22 |   async goto() {
> 23 |     await this.page.goto('/products/add');
     |                     ^ Error: page.goto: Protocol error (Page.navigate): Cannot navigate to invalid URL
  24 |   }
  25 | 
  26 |   async fillProductForm(name: string, price: string, date?: string) {
  27 |     await this.nameInput.fill(name);
  28 |     await this.priceInput.fill(price);
  29 |     if (date) {
  30 |       await this.dateInput.fill(date);
  31 |     }
  32 |   }
  33 | 
  34 |   async submitForm() {
  35 |     await this.submitButton.click();
  36 |   }
  37 | 
  38 |   async addProduct(name: string, price: string, date?: string) {
  39 |     await this.fillProductForm(name, price, date);
  40 |     await this.submitForm();
  41 |   }
  42 | }
  43 | 
```