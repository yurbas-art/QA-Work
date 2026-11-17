import { Page, Locator } from '@playwright/test';

export class AddProductPage {
  readonly page: Page;
  readonly nameInput: Locator;
  readonly priceInput: Locator;
  readonly dateInput: Locator;
  readonly submitButton: Locator;
  readonly errorMessage: Locator;
  readonly successMessage: Locator;

  constructor(page: Page) {
    this.page = page;
    this.nameInput = page.getByPlaceholder('Product name');
    this.priceInput = page.getByPlaceholder('Price');
    this.dateInput = page.locator('input[type="date"]');
    this.submitButton = page.getByRole('button', { name: 'Add Product' });
    this.errorMessage = page.locator('[data-testid="error-message"]');
    this.successMessage = page.locator('[data-testid="success-message"]');
  }

  async goto() {
    await this.page.goto('/products/add');
  }

  async fillProductForm(name: string, price: string, date?: string) {
    await this.nameInput.fill(name);
    await this.priceInput.fill(price);
    if (date) {
      await this.dateInput.fill(date);
    }
  }

  async submitForm() {
    await this.submitButton.click();
  }

  async addProduct(name: string, price: string, date?: string) {
    await this.fillProductForm(name, price, date);
    await this.submitForm();
  }
}
