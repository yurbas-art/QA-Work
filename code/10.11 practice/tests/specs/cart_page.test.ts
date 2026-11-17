import { test, expect } from '../../fixtures/base.fixture';

test.describe('Cart page', () => {
  test('opens and shows empty or filled state', async ({ cartPage }) => {
    await cartPage.open();

    const hasItems = await cartPage.hasItems();
    const isEmpty = await cartPage.isEmpty();

    expect(hasItems || isEmpty).toBeTruthy();
  });
});
