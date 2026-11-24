// code/24.11/tests/page 
import { Page } from '@playwright/test';
import { BasePage } from './BasePage';

export class HomePage extends BasePage {
    constructor(page: Page) {
        super(page);
    }

    async openHome() {
        await this.open('/');
    }

    async openProducts() {
        await this.open('/products/');
    }

    async openContact() {
        await this.open('/contact/');
    }

    async checkHeading() {
        return await this.page.locator('h1').isVisible();
    }
}
