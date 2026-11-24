// code/24.11/tests/page 
import { Page, Locator } from '@playwright/test';

export class BasePage {
    protected page: Page;
    protected baseUrl = 'https://green-extrusion.eu';

        constructor(page: Page) {
            this.page = page;
        }

        async open(path = '') {
            await this.page.goto(`${this.baseUrl}${path}`, {
                waitUntil: 'domcontentloaded',
                timeout: 30000
            });
        }

        async click(locator: Locator) {
            await locator.click();
        }

        async getText(locator: Locator) {
            return await locator.innerText();
        }

        async isVisible(locator: Locator) {
            return await locator.isVisible();
        }
}
