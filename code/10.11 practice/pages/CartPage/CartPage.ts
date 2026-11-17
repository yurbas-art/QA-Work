import { Page, Locator } from '@playwright/test';

export class CartPage {
  readonly page: Page;
  readonly emptyMessage: Locator;
  readonly cartItems: Locator;

  constructor(page: Page) {
    this.page = page;
    this.emptyMessage = page
      .locator('.empty-message__title-empty-cart')
      .or(page.getByText(/пока пусто|корзина пуста|нет товаров/i));
    this.cartItems = page.locator('[class*="cart-item"]');
  }

  async open() {
    // DNS блокирует прямые переходы на /cart/ (401/403): антибот проверяет
    // навигацию и пропускает только переход по внутренней ссылке сайта.
    // Поэтому сначала открываем главную и кликаем по ссылке корзины.
    await this.page.goto('dns-shop.ru/', { waitUntil: 'domcontentloaded' });

    const cartLink = this.page.locator('[data-cy="test-cart-button"]');
    await cartLink.waitFor({ state: 'visible', timeout: 20_000 });
    await cartLink.click();

    await this.page.waitForURL('**/cart/**', { timeout: 20_000 });

    await this.emptyMessage
      .or(this.cartItems.first())
      .first()
      .waitFor({ state: 'attached', timeout: 15_000 })
      .catch(() => {});
  }

  async hasItems(): Promise<boolean> {
    return (await this.cartItems.count()) > 0;
  }

  async isEmpty(): Promise<boolean> {
    return this.emptyMessage.isVisible().catch(() => false);
  }
}
