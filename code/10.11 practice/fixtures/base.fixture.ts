import { test as base } from '@playwright/test';

import { CartPage } from '../pages/CartPage/CartPage';

type Fixtures = {
  cartPage: CartPage;
};

export const test = base.extend<Fixtures>({
  cartPage: async ({ page }, use) => {
    await page.addInitScript(() => {
      Object.defineProperty(navigator, 'webdriver', { get: () => undefined });
    });
    await use(new CartPage(page));
  },
});

export { expect } from '@playwright/test';
