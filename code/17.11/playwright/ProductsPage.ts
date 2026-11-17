import { Page, Locator } from '@playwright/test';

export class ProductsPage {
  readonly page: Page;
  readonly filterInput: Locator;
  readonly filterButton: Locator;
  readonly productRows: Locator;
  readonly deleteButtons: Locator;
  readonly confirmDeleteButton: Locator;
  readonly emptyState: Locator;

  constructor(page: Page) {
    this.page = page;
    this.filterInput = page.getByPlaceholder('Filter by product name');
    this.filterButton = page.getByRole('button', { name: 'Filter' });
    this.productRows = page.locator('[data-testid="product-row"]');
    this.deleteButtons = page.locator('[data-testid="delete-btn"]');
    this.confirmDeleteButton = page.getByRole('button', { name: 'Confirm' });
    this.emptyState = page.getByText('No products found');
  }

  async goto() {
    await this.page.goto('/products');
  }

  async filterByName(name: string) {
    await this.filterInput.fill(name);
    await this.filterButton.click();
  }

  async deleteProductByName(name: string) {
    const row = this.productRows.filter({ hasText: name });
    await row.locator('[data-testid="delete-btn"]').click();
  }

  async confirmDeletion() {
    await this.confirmDeleteButton.click();
  }
}
